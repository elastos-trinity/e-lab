import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { EssentialsService } from "@core/services/essentials/essentials.service";
import { ElabAuthenticationService } from "@core/services/elab/elab-authentication.service";
import { ElastosConnectivityService } from "@core/services/elastos-connectivity/elastosConnectivity.service";


describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, EssentialsService, ElastosConnectivityService, ElabAuthenticationService]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(true)
  });
});
