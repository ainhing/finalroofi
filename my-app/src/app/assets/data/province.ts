// ===== MODELS =====
export interface Ward {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
  wards: Ward[];
}

export interface Province {
  code: number;
  name: string;
  districts?: District[];
}

// ===== OPTIONAL: nếu sau này muốn lưu data tĩnh =====
export const PROVINCES: Province[] = [];
