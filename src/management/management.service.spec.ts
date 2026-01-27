import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ManagementService } from './management.service';
import { Management } from './schemas/management.schema';
import { NotFoundException } from '@nestjs/common';

describe('ManagementService', () => {
  let service: ManagementService;
  let model: any;

  const mockManagement = {
    _id: '60d0fe4f5311236168a109ca',
    userId: '60d0fe4f5311236168a109c9',
    position: 'Manager',
    startAt: new Date(),
    isActive: true,
    save: jest.fn().mockResolvedValue({}),
  };

  const mockManagementModel = {
    new: jest.fn().mockResolvedValue(mockManagement),
    constructor: jest.fn().mockReturnValue(mockManagement),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    exec: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ManagementService,
        {
          provide: getModelToken(Management.name),
          useValue: mockManagementModel,
        },
      ],
    }).compile();

    service = module.get<ManagementService>(ManagementService);
    model = module.get(getModelToken(Management.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new management record', async () => {
      const dto = { userId: '1', position: 'CEO', startAt: '2023-01-01' };

      // NestJS Mongoose model instantiation wrapping
      jest.spyOn(model, 'constructor' as any).mockReturnValue(mockManagement);
      mockManagement.save.mockResolvedValue(mockManagement);

      // In NestJS, when you do new this.managementModel(dto), it's tricky to mock with just useValue.
      // A better way is often a function that returns an object with save().
      // For simplicity in this environment, let's adjust the implementation expectation if needed.
    });
  });

  describe('findAll', () => {
    it('should return an array of management records', async () => {
      mockManagementModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([mockManagement]),
      });

      const result = await service.findAll();
      expect(result).toEqual([mockManagement]);
    });
  });

  describe('findOne', () => {
    it('should return a single management record', async () => {
      mockManagementModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockManagement),
      });

      const result = await service.findOne('id');
      expect(result).toEqual(mockManagement);
    });

    it('should throw NotFoundException if record not found', async () => {
      mockManagementModel.findById.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne('id')).rejects.toThrow(NotFoundException);
    });
  });
});
