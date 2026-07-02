import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateProjectStatusDto } from './dto/update-project-status.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo projeto', description: 'Cria um projeto e calcula automaticamente seu risco baseado nas datas e orçamento.' })
  @ApiResponse({ status: 201, description: 'Projeto criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos ou datas inconsistentes.' })
  create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os projetos', description: 'Retorna a lista de todos os projetos cadastrados ordenados por data de criação.' })
  @ApiResponse({ status: 200, description: 'Lista de projetos retornada com sucesso.' })
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar projeto por ID', description: 'Retorna os detalhes de um projeto específico através do seu ID UUID.' })
  @ApiResponse({ status: 200, description: 'Projeto retornado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar projeto', description: 'Atualiza os dados cadastrais do projeto e recalcula o risco caso datas ou orçamento sofram alteração.' })
  @ApiResponse({ status: 200, description: 'Projeto atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos ou datas inconsistentes.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status do projeto', description: 'Altera o status do projeto aplicando validações estritas da máquina de estados.' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Transição de status inválida.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  updateStatus(@Param('id') id: string, @Body() updateProjectStatusDto: UpdateProjectStatusDto) {
    return this.projectsService.updateStatus(id, updateProjectStatusDto);
  }

  @Get(':id/ai-analysis')
  @ApiOperation({ summary: 'Análise de Inteligência Artificial', description: 'Envia os dados do projeto para a API do Google Gemini gerar um relatório detalhado de viabilidade em Markdown.' })
  @ApiResponse({ status: 200, description: 'Relatório de viabilidade em Markdown retornado com sucesso.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  analyze(@Param('id') id: string) {
    return this.projectsService.analyze(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir projeto', description: 'Exclui permanentemente o projeto do banco de dados, exceto se estiver ativo (Em andamento ou Encerrado).' })
  @ApiResponse({ status: 204, description: 'Projeto excluído com sucesso.' })
  @ApiResponse({ status: 400, description: 'Bloqueio de exclusão de projetos ativos.' })
  @ApiResponse({ status: 404, description: 'Projeto não encontrado.' })
  remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
