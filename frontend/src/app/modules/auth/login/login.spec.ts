import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginComponent } from './login';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loginForm debería ser inválido si está vacío', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('loginForm debería ser válido con datos correctos', () => {
    component.loginForm.setValue({
      email: 'test@correo.com',
      password: '12345678',
    });
    expect(component.loginForm.valid).toBeTruthy();
  });
});