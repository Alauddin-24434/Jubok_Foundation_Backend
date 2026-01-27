import { Test, TestingModule } from '@nestjs/testing';
import { ManagementController } from './management.controller';
import { ManagementService } from './management.service';

describe('ManagementController', () => {
  let controller: ManagementController;
  let service: ManagementService;

  const mockManagementService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ManagementController],
      providers: [
        {
          provide: ManagementService,
          useValue: mockManagementService,
        },
      ],
    }).compile();

    controller = module.get<ManagementController>(ManagementController);
    service = module.get<ManagementService>(ManagementService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of management records', async () => {
      const result = [{ position: 'Manager' }];
      mockManagementService.findAll.mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
    });
  });

  describe('findOne', () => {
    it('should return a single management record', async () => {
      const result = { position: 'Manager' };
      mockManagementService.findOne.mockResolvedValue(result);

      expect(await controller.findOne('id')).toBe(result);
    });
  });
});
