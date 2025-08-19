import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Put,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiQuery,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { MenuService } from './menu.service';
import {
  CreateMenuDto,
  UpdateMenuDto,
  MenuResponseDto,
  GetMenusQueryDto,
  MenuListResponseDto,
  SingleMenuResponseDto,
} from './dto/menu.dto';
import { JwtAuthGuard } from '../../common/guard/jwt-auth.guard';

@ApiTags('Menu')
@ApiBearerAuth('jwt')
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Create new menu',
    description:
      'Create a new menu item with optional permissions. ⚠️ Penting: Gunakan parent_id: null untuk menu root, jangan gunakan 0',
  })
  @ApiBody({
    type: CreateMenuDto,
    description: 'Menu data to create',
    examples: {
      menuRoot: {
        summary: 'Menu Root (tanpa parent)',
        description: 'Contoh membuat menu root',
        value: {
          parent_id: null,
          menu_name: 'User Management',
          menu_code: 'USER_MANAGEMENT',
          icon: 'user',
          url: '/users',
          is_parent: false,
          sort_order: 1,
          status: 'active',
          module: 'production',
          createdBy: 1,
          permissionIds: [1],
        },
      },
      subMenu: {
        summary: 'Sub Menu (dengan parent)',
        description: 'Contoh membuat sub-menu',
        value: {
          parent_id: 1,
          menu_name: 'User List',
          menu_code: 'USER_LIST',
          icon: 'list',
          url: '/users/list',
          is_parent: false,
          sort_order: 1,
          status: 'active',
          module: 'production',
          createdBy: 1,
          permissionIds: [1, 2],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Menu created successfully',
    type: SingleMenuResponseDto,
    schema: {
      example: {
        statusCode: 201,
        message: 'Menu created successfully',
        data: {
          id: 1,
          parent_id: null,
          menu_name: 'User Management',
          menu_code: 'USER_MANAGEMENT',
          icon: 'user',
          url: '/users',
          is_parent: false,
          sort_order: 1,
          status: 'active',
          module: 'production',
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation error',
    schema: {
      example: {
        statusCode: 400,
        message: 'menu_name should not be empty',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - menu code already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Menu code already exists',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
    schema: {
      example: {
        statusCode: 500,
        message: 'Internal server error',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  create(@Body() createMenuDto: CreateMenuDto, @Request() req: any) {
    if (!createMenuDto.createdBy) {
      createMenuDto.createdBy = req.user?.id;
    }
    return this.menuService.create(createMenuDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Get all menus',
    description: 'Retrieve paginated list of menus with optional filtering',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term for menu_name or menu_code',
  })
  @ApiQuery({
    name: 'module',
    required: false,
    description: 'Filter by module (spare-part, production)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (active, inactive)',
  })
  @ApiQuery({
    name: 'is_parent',
    required: false,
    description: 'Filter by is_parent (true, false)',
  })
  @ApiQuery({
    name: 'parent_id',
    required: false,
    description: 'Filter by parent_id',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort by field (default: sort_order)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (ASC, DESC, default: ASC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Menus retrieved successfully',
    type: MenuListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get menus successfully',
        data: [
          {
            id: 1,
            parent_id: null,
            menu_name: 'User Management',
            menu_code: 'USER_MANAGEMENT',
            icon: 'user',
            url: '/users',
            is_parent: true,
            sort_order: 1,
            status: 'active',
            module: 'production',
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
            children: [
              {
                id: 2,
                parent_id: 1,
                menu_name: 'User List',
                menu_code: 'USER_LIST',
                icon: 'list',
                url: '/users/list',
                is_parent: false,
                sort_order: 1,
                status: 'active',
                module: 'production',
                createdAt: '2024-01-01T00:00:00.000Z',
                createdBy: 1,
                updatedAt: '2024-01-01T00:00:00.000Z',
                updatedBy: 1,
              },
            ],
          },
        ],
        meta: {
          total: 1,
          page: 1,
          limit: 10,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Parameter query tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  findAll(@Query() query: GetMenusQueryDto) {
    return this.menuService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tree')
  @ApiOperation({
    summary: 'Get menu tree',
    description: 'Retrieve hierarchical menu structure',
  })
  @ApiResponse({
    status: 200,
    description: 'Menu tree retrieved successfully',
    type: MenuListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get menu tree successfully',
        data: [
          {
            id: 1,
            parent_id: null,
            menu_name: 'User Management',
            menu_code: 'USER_MANAGEMENT',
            icon: 'user',
            url: '/users',
            is_parent: true,
            sort_order: 1,
            status: 'active',
            module: 'production',
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
            children: [
              {
                id: 2,
                parent_id: 1,
                menu_name: 'User List',
                menu_code: 'USER_LIST',
                icon: 'list',
                url: '/users/list',
                is_parent: false,
                sort_order: 1,
                status: 'active',
                module: 'production',
                createdAt: '2024-01-01T00:00:00.000Z',
                createdBy: 1,
                updatedAt: '2024-01-01T00:00:00.000Z',
                updatedBy: 1,
              },
            ],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  getMenuTree() {
    return this.menuService.getMenuTree();
  }

  @UseGuards(JwtAuthGuard)
  @Get('module/:module')
  @ApiOperation({
    summary: 'Get menus by module',
    description: 'Retrieve all menus for a specific module',
  })
  @ApiResponse({
    status: 200,
    description: 'Module menus retrieved successfully',
    type: MenuListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get menus for module production successfully',
        data: [
          {
            id: 1,
            parent_id: null,
            menu_name: 'User Management',
            menu_code: 'USER_MANAGEMENT',
            icon: 'user',
            url: '/users',
            is_parent: true,
            sort_order: 1,
            status: 'active',
            module: 'production',
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Module tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  findByModule(@Param('module') module: string) {
    return this.menuService.findByModule(module);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tree/module/:module')
  @ApiOperation({
    summary: 'Get menu tree by module',
    description: 'Retrieve hierarchical menu structure for a specific module',
  })
  @ApiResponse({
    status: 200,
    description: 'Module menu tree retrieved successfully',
    type: MenuListResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get menu tree for module production successfully',
        data: [
          {
            id: 1,
            parent_id: null,
            menu_name: 'User Management',
            menu_code: 'USER_MANAGEMENT',
            icon: 'user',
            url: '/users',
            is_parent: true,
            sort_order: 1,
            status: 'active',
            module: 'production',
            createdAt: '2024-01-01T00:00:00.000Z',
            createdBy: 1,
            updatedAt: '2024-01-01T00:00:00.000Z',
            updatedBy: 1,
            children: [
              {
                id: 2,
                parent_id: 1,
                menu_name: 'User List',
                menu_code: 'USER_LIST',
                icon: 'list',
                url: '/users/list',
                is_parent: false,
                sort_order: 1,
                status: 'active',
                module: 'production',
                createdAt: '2024-01-01T00:00:00.000Z',
                createdBy: 1,
                updatedAt: '2024-01-01T00:00:00.000Z',
                updatedBy: 1,
              },
            ],
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Module tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  getMenuTreeByModule(@Param('module') module: string) {
    return this.menuService.getMenuTreeByModule(module);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Get menu by ID',
    description: 'Retrieve a specific menu by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Menu retrieved successfully',
    type: SingleMenuResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Get menu successfully',
        data: {
          id: 1,
          parent_id: null,
          menu_name: 'User Management',
          menu_code: 'USER_MANAGEMENT',
          icon: 'user',
          url: '/users',
          is_parent: true,
          sort_order: 1,
          status: 'active',
          module: 'production',
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
          children: [
            {
              id: 2,
              parent_id: 1,
              menu_name: 'User List',
              menu_code: 'USER_LIST',
              icon: 'list',
              url: '/users/list',
              is_parent: false,
              sort_order: 1,
              status: 'active',
              module: 'production',
              createdAt: '2024-01-01T00:00:00.000Z',
              createdBy: 1,
              updatedAt: '2024-01-01T00:00:00.000Z',
              updatedBy: 1,
            },
          ],
          permissions: [
            {
              id: 1,
              name: 'read',
              description: 'Read permission',
              slug: 'read',
            },
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 404,
    description: 'Menu not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Menu not found',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Update menu',
    description: 'Update an existing menu by ID',
  })
  @ApiBody({
    type: UpdateMenuDto,
    description: 'Menu data to update',
  })
  @ApiResponse({
    status: 200,
    description: 'Menu updated successfully',
    type: SingleMenuResponseDto,
    schema: {
      example: {
        statusCode: 200,
        message: 'Menu updated successfully',
        data: {
          id: 1,
          parent_id: null,
          menu_name: 'User Management Updated',
          menu_code: 'USER_MANAGEMENT',
          icon: 'user',
          url: '/users',
          is_parent: true,
          sort_order: 1,
          status: 'active',
          module: 'production',
          createdAt: '2024-01-01T00:00:00.000Z',
          createdBy: 1,
          updatedAt: '2024-01-01T00:00:00.000Z',
          updatedBy: 1,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Data tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 404,
    description: 'Menu not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Menu not found',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - menu code already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'Menu code already exists',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
    @Request() req: any,
  ) {
    if (!updateMenuDto.updatedBy) {
      updateMenuDto.updatedBy = req.user?.id;
    }
    return this.menuService.update(id, updateMenuDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete menu',
    description:
      'Soft delete a menu by ID (marks as deleted but keeps in database)',
  })
  @ApiResponse({
    status: 200,
    description: 'Menu deleted successfully',
    schema: {
      example: {
        statusCode: 200,
        message: 'Menu deleted successfully',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - ID tidak valid',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - JWT token tidak valid atau tidak ada',
  })
  @ApiResponse({
    status: 404,
    description: 'Menu not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Menu not found',
        error: true,
        timestamp: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Terjadi kesalahan pada server',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    const deletedBy = req.user?.id;
    return this.menuService.remove(id, deletedBy);
  }
}
