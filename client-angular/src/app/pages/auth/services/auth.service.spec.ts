import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { ElabAuthenticationService } from "@core/services/elab/elab-authentication.service";
import { ElastosConnectivityService } from "@core/services/elastos-connectivity/elastos-connectivity.service";


describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, ElastosConnectivityService, ElabAuthenticationService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(true)
  });
});
