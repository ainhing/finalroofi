import { Injectable } from '@angular/core';
import { Authservice } from './authservice';

export interface Voucher {
  title: string;
  discount: string;
  code: string;
  saved: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class Voucherservice {
  private readonly STORAGE_PREFIX = 'SAVED_VOUCHERS_';
  private readonly APPLIED_PREFIX = 'APPLIED_VOUCHER_';
  
  // Danh sách voucher gốc (dùng chung cho mọi user)
  private readonly baseVouchers: Voucher[] = [
    {
      title: 'Giảm 10% cho đơn từ 500k',
      discount: '-10%',
      code: 'ROOFI10',
      saved: false
    },
    {
      title: 'Giảm 100k cho đơn từ 1 triệu',
      discount: '-100.000đ',
      code: 'ROOFI100',
      saved: false
    },
    {
      title: 'Giảm 20% dành cho thành viên mới',
      discount: '-20%',
      code: 'NEW20',
      saved: false
    },
    {
      title: 'Miễn phí vận chuyển toàn quốc',
      discount: 'Free Ship',
      code: 'FREESHIP',
      saved: false
    },
    {
      title: 'Giảm 150k cho đơn từ 1.5 triệu',
      discount: '-150.000đ',
      code: 'ROOFI150',
      saved: false
    },
    {
      title: 'Mua 2 sản phẩm giảm 15%',
      discount: '-15%',
      code: 'BUY2SAVE15',
      saved: false
    },
    {
      title: 'Giảm 50k cho đơn từ 800k',
      discount: '-50.000đ',
      code: 'SAVE50',
      saved: false
    },
    {
      title: 'Tặng quà xinh khi mua từ 1.2 triệu',
      discount: 'Quà tặng',
      code: 'GIFT2026',
      saved: false
    }
  ];

  private vouchers: Voucher[] = [];

  constructor(private authService: Authservice) {
    this.loadFromStorage();
  }

  // Lấy tất cả voucher (đã merge với trạng thái saved của từng user)
  getVouchers(): Voucher[] {
    this.loadFromStorage();
    return this.vouchers;
  }

  // Lấy danh sách voucher đã lưu của user hiện tại
  getSavedVouchers(): Voucher[] {
    return this.getVouchers().filter(v => v.saved);
  }

  // Lưu voucher cho user hiện tại
  saveVoucher(code: string) {
    this.loadFromStorage();
    const voucher = this.vouchers.find(v => v.code === code);
    if (voucher) {
      voucher.saved = true;
      this.saveToStorage();
    }
  }

  // Áp dụng voucher
  applyVoucher(code: string, subtotal: number, totalQuantity?: number) {
    // Đảm bảo lấy đúng trạng thái voucher theo user hiện tại
    this.loadFromStorage();

    const voucher = this.vouchers.find(v => v.code === code);
    
    if (!voucher) {
      return { valid: false, discount: 0, message: 'Mã voucher không tồn tại!' };
    }

    // Kiểm tra điều kiện minimum
    if (voucher.code === 'ROOFI10' && subtotal < 500000) {
      return { valid: false, discount: 0, message: 'Đơn hàng tối thiểu 500.000đ!' };
    }
    
    if (voucher.code === 'ROOFI100' && subtotal < 1000000) {
      return { valid: false, discount: 0, message: 'Đơn hàng tối thiểu 1.000.000đ!' };
    }
    
    if (voucher.code === 'ROOFI150' && subtotal < 1500000) {
      return { valid: false, discount: 0, message: 'Đơn hàng tối thiểu 1.500.000đ!' };
    }
    
    if (voucher.code === 'SAVE50' && subtotal < 800000) {
      return { valid: false, discount: 0, message: 'Đơn hàng tối thiểu 800.000đ!' };
    }

    // BUY2SAVE15: Yêu cầu ít nhất 2 sản phẩm
    if (voucher.code === 'BUY2SAVE15' && (!totalQuantity || totalQuantity < 2)) {
      return { valid: false, discount: 0, message: 'Voucher này yêu cầu mua ít nhất 2 sản phẩm!' };
    }

    // Tính discount
    let discount = 0;
    
    if (voucher.discount.includes('%')) {
      const percent = parseInt(voucher.discount.replace(/[^0-9]/g, ''));
      discount = subtotal * percent / 100;
    } else if (voucher.discount.includes('đ')) {
      discount = parseInt(voucher.discount.replace(/[^0-9]/g, ''));
    } else if (voucher.code === 'FREESHIP') {
      discount = 30000; // Free ship
    }

    return { valid: true, discount, message: 'Áp dụng voucher thành công!' };
  }

  // Validate voucher đang áp dụng khi subtotal thay đổi
  validateAppliedVoucher(subtotal: number, totalQuantity?: number) {
    const appliedCode = this.getAppliedVoucher();
    if (!appliedCode) {
      return { valid: true, needsRemoval: false };
    }

    const result = this.applyVoucher(appliedCode, subtotal, totalQuantity);
    if (!result.valid) {
      return { 
        valid: false, 
        needsRemoval: true, 
        message: result.message || 'Voucher đã bị hủy do đơn hàng không còn đủ điều kiện' 
      };
    }

    return { valid: true, needsRemoval: false, message: '' };
  }

  // Lưu voucher đã áp dụng (theo user)
  saveAppliedVoucher(code: string) {
    localStorage.setItem(this.getAppliedKey(), code);
  }

  // Lấy voucher đã áp dụng (theo user)
  getAppliedVoucher(): string {
    return localStorage.getItem(this.getAppliedKey()) || '';
  }

  // Xóa voucher đã áp dụng (theo user)
  removeAppliedVoucher() {
    localStorage.removeItem(this.getAppliedKey());
  }

  // Đánh dấu voucher đã dùng: bỏ saved + bỏ applied (per user)
  consumeVoucher(code: string) {
    if (!code) return;
    this.loadFromStorage();
    const voucher = this.vouchers.find(v => v.code === code);
    if (voucher) {
      voucher.saved = false;
      this.saveToStorage();
    }
    const applied = this.getAppliedVoucher();
    if (applied === code) {
      this.removeAppliedVoucher();
    }
  }

  private getStorageKey(): string {
    const user = this.authService.getCurrentUser();
    const email = user?.email?.toLowerCase?.() || 'guest';
    return `${this.STORAGE_PREFIX}${email}`;
  }

  private getAppliedKey(): string {
    const user = this.authService.getCurrentUser();
    const email = user?.email?.toLowerCase?.() || 'guest';
    return `${this.APPLIED_PREFIX}${email}`;
  }

  private saveToStorage() {
    localStorage.setItem(this.getStorageKey(), JSON.stringify(this.vouchers));
  }

  private loadFromStorage() {
    // Bắt đầu từ base vouchers để tránh rò rỉ trạng thái giữa user
    this.vouchers = [...this.baseVouchers];

    const saved = localStorage.getItem(this.getStorageKey());
    if (saved) {
      try {
        const savedVouchers = JSON.parse(saved);
        this.vouchers = this.vouchers.map(v => {
          const savedVoucher = savedVouchers.find((sv: any) => sv.code === v.code);
          return savedVoucher ? { ...v, saved: savedVoucher.saved } : v;
        });
      } catch (e) {
        console.error('Error loading vouchers:', e);
      }
    }
  }
}
