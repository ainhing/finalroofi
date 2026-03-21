import { Component, OnInit } from '@angular/core';
import { Voucher, Voucherservice } from '../../services/voucherservice';
import { Notificationservice } from '../../services/notificationservice';
import { Router } from '@angular/router';

@Component({
  selector: 'app-saved-vouchers',
  standalone: false,
  templateUrl: './saved-vouchers.html',
})
export class SavedVouchers implements OnInit {
  saved: Voucher[] = [];

  constructor(
    private voucherService: Voucherservice,
    private notify: Notificationservice,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.saved = this.voucherService.getSavedVouchers();
  }

  copyCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.notify.success(`Đã sao chép mã ${code}`);
    }).catch(() => {
      this.notify.error('Không thể sao chép, hãy bôi đen và copy thủ công.');
    });
  }

  goToCartWithCode(code: string) {
    // Lưu mã vào applied storage để gợi ý khi vào giỏ
    this.voucherService.saveAppliedVoucher(code);
    this.notify.success(`Đã lưu mã ${code}. Vào giỏ hàng để áp dụng.`);
    this.router.navigate(['/cart']);
  }

  refresh() {
    this.load();
    this.notify.info('Đã làm mới danh sách voucher');
  }
}
