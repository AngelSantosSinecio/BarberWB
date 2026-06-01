import { TestBed } from '@angular/core/testing';

import { Barbers } from './barbers';

describe('Barbers', () => {
  let service: Barbers;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Barbers);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
