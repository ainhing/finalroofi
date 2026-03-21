import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Province, District, Ward } from '../../app/assets/data/province';

@Injectable({
  providedIn: 'root'
})
export class ProvinceService {

  private HOST = 'https://provinces.open-api.vn/api';

  constructor(private http: HttpClient) {}

  getProvinces(): Observable<Province[]> {
    return this.http.get<Province[]>(`${this.HOST}/?depth=1`);
  }

  getDistricts(provinceCode: number): Observable<District[]> {
    return this.http
      .get<{ districts: District[] }>(`${this.HOST}/p/${provinceCode}?depth=2`)
      .pipe(map(res => res.districts));
  }

  getWards(districtCode: number): Observable<Ward[]> {
    return this.http
      .get<{ wards: Ward[] }>(`${this.HOST}/d/${districtCode}?depth=2`)
      .pipe(map(res => res.wards));
  }
}
