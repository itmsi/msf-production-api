import { Barge } from '../entities/barge.entity';

describe('Barge Entity', () => {
  it('should be defined', () => {
    expect(Barge).toBeDefined();
  });

  it('should have correct table name', () => {
    const barge = new Barge();
    expect(barge.constructor.name).toBe('Barge');
  });

  it('should have all required properties', () => {
    const barge = new Barge();
    
    expect(barge).toHaveProperty('id');
    expect(barge).toHaveProperty('name');
    expect(barge).toHaveProperty('capacity');
    expect(barge).toHaveProperty('remarks');
    expect(barge).toHaveProperty('createdAt');
    expect(barge).toHaveProperty('createdBy');
    expect(barge).toHaveProperty('updatedAt');
    expect(barge).toHaveProperty('updatedBy');
    expect(barge).toHaveProperty('deletedAt');
    expect(barge).toHaveProperty('deletedBy');
  });

  it('should create instance with data', () => {
    const bargeData = {
      id: 1,
      name: 'Barge Kalimantan',
      capacity: 1000,
      remarks: 'Test remarks',
      createdBy: 1,
      updatedBy: 1,
    };

    const barge = Object.assign(new Barge(), bargeData);

    expect(barge.id).toBe(bargeData.id);
    expect(barge.name).toBe(bargeData.name);
    expect(barge.capacity).toBe(bargeData.capacity);
    expect(barge.remarks).toBe(bargeData.remarks);
    expect(barge.createdBy).toBe(bargeData.createdBy);
    expect(barge.updatedBy).toBe(bargeData.updatedBy);
  });

  it('should handle nullable fields correctly', () => {
    const barge = new Barge();
    
    // These fields should be nullable
    expect(barge.name).toBeUndefined();
    expect(barge.capacity).toBeUndefined();
    expect(barge.remarks).toBeUndefined();
    expect(barge.createdBy).toBeUndefined();
    expect(barge.updatedBy).toBeUndefined();
    expect(barge.deletedAt).toBeUndefined();
    expect(barge.deletedBy).toBeUndefined();
  });

  it('should have correct data types', () => {
    const barge = new Barge();
    
    expect(typeof barge.id).toBe('number');
    expect(typeof barge.name).toBe('string');
    expect(typeof barge.capacity).toBe('number');
    expect(typeof barge.remarks).toBe('string');
    expect(typeof barge.createdBy).toBe('number');
    expect(typeof barge.updatedBy).toBe('number');
    expect(typeof barge.deletedBy).toBe('number');
  });
});
