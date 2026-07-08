import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterComponent } from './register';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('registerForm debería ser inválido si está vacío', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('registerForm debería ser inválido si la contraseña no tiene letras y números', () => {
    component.registerForm.setValue({
      username: 'usuario',
      email: 'test@correo.com',
      password: '12345678', // solo números, sin letras
    });
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('registerForm debería ser válido con datos correctos', () => {
    component.registerForm.setValue({
      username: 'usuario',
      email: 'test@correo.com',
      password: 'abcd1234',
    });
    expect(component.registerForm.valid).toBeTruthy();
  });
});