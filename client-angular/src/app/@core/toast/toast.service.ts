import {
  Injectable
} from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(
    private toastr: ToastrService
  ) { }

  public error(message: string) {
    this.toastr.error(message);
  }
}
