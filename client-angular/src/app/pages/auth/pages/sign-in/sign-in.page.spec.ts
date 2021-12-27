import { SignInPage } from './sign-in.page';
import { MockBuilder } from "ng-mocks";
import { ElastosConnectivityService } from "@core/services/elastos-connectivity/elastos-connectivity.service";
import { AuthService } from "@pages/auth/services/auth.service";

describe('SignInPage', () => {
  beforeEach(async () => {
    return MockBuilder(SignInPage).mock([ElastosConnectivityService, AuthService]);
  });

  it('should create', () => {
    expect(1)
  });

});
