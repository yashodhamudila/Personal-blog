import { HttpStatus, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { FilterQuery, Model, ObjectId } from 'mongoose'
import { ConfigService } from '@nestjs/config'
import { IFile } from '@/file/interfaces/file.interface'
import { File, FileDocument } from '@/file/schemas/file.schema'
//import { CreateCategoryDto } from './dto/create-category.dto';
//import { UpdateCategoryDto } from './dto/update-category.dto';
import { UpdateFileDto } from '@/file/dto/update-file.dto'
import { ExceptionHelper } from '@/common/helpers/exception.helper'
import { CoreMessage } from '@/common/messages'
import { IListQueryResponse, IQuery } from '@/common/interfaces/query.interface'
import { IEnv } from '@/common/interfaces/env.interface'
import { ArticleService } from '@/article/article.service'
import { PageService } from '@/page/page.service'

@Injectable()
export class FileService {
  constructor(
    @InjectModel(File.name) private readonly serviceModel: Model<FileDocument>,
    private readonly coreMessage: CoreMessage,
    private configService: ConfigService<IEnv>,
    private articleService: ArticleService,
    private pageService: PageService,
  ) {}

  async getItems(
    query: IQuery,
    folderId: any,
  ): Promise<IListQueryResponse<IFile[]> | IFile[]> {
    try {
      const { pagination, searchQuery, order, paging } = query
      const newSearchQuery: FilterQuery<FileDocument> = {
        ...searchQuery,
        folderId: folderId === 'null' ? null : folderId,
      }
      if (paging) {
        const { page, pageSize, skip } = pagination
        const items = await this.serviceModel
          .find(newSearchQuery)
          .limit(pageSize)
          .sort(order)
          .skip(skip)
          .exec()

        const count = await this.serviceModel
          .find(newSearchQuery)
          .countDocuments()

        const totalPages = Math.ceil(count / pageSize)

        const data: IListQueryResponse<IFile[]> = {
          results: items,
          currentPage: page,
          currentPageSize: items.length,
          pageSize: pageSize,
          totalPages,
          totalResults: count,
          hasNextPage: page < totalPages ? true : false,
        }
        return data
      }
      return await this.serviceModel.find(newSearchQuery).sort(order).exec()
    } catch (err) {
      console.log(err)
      throw new ExceptionHelper(
        this.coreMessage.BAD_REQUEST,
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  async saveFile(data: File[]): Promise<IFile[]> {
    try {
      const createItems = await this.serviceModel.insertMany(data)
      return createItems
    } catch (err) {
      throw new ExceptionHelper(
        this.coreMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async createFolder(
    folderTitle: string,
    path: string,
    folderId: ObjectId,
  ): Promise<IFile> {
    try {
      const findFolderPath = await this.getFolderByPath(path)
      if (findFolderPath) return findFolderPath

      const create = new this.serviceModel({
        title: folderTitle,
        description: null,
        filename: null,
        isFolder: true,
        mimetype: null,
        path,
        size: null,
        folderId,
      })
      return create.save()
    } catch (err) {
      throw new ExceptionHelper(
        this.coreMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async getFolderByPath(path: string): Promise<IFile> {
    try {
      return await this.serviceModel.findOne({ isFolder: true, path }).exec()
    } catch (err) {
      throw new ExceptionHelper(
        this.coreMessage.BAD_REQUEST,
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  async update(body: UpdateFileDto, id: ObjectId): Promise<IFile> {
    try {
      return await this.serviceModel.findByIdAndUpdate(
        id,
        {
          $set: body,
        },
        {
          new: true,
        },
      )
    } catch (err) {
      throw new ExceptionHelper(
        this.coreMessage.BAD_REQUEST,
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  async delete(id: ObjectId): Promise<void> {
    try {
      await this.serviceModel.findByIdAndDelete(id)
    } catch (err) {
      throw new ExceptionHelper(
        this.coreMessage.INTERNAL_SERVER_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  async getItemById(_id: ObjectId): Promise<IFile> {
    try {
      return await this.serviceModel
        .findOne({ _id })
        .populate('folderId')
        .exec()
    } catch (err) {
      throw new ExceptionHelper(
        this.coreMessage.BAD_REQUEST,
        HttpStatus.BAD_REQUEST,
      )
    }
  }

  async checkFile(item: IFile): Promise<boolean> {
    try {
      if (item.isFolder) {
        const checkFolder = await this.serviceModel.exists({
          folderId: item._id,
        })
        return checkFolder?._id ? true : false
      }

      const articleSearchCoverImage =
        await this.articleService.searchCoverImage(item._id)
      const articleSearchContentText = await this.articleService.searchContent(
        item.filename,
      )
      const pageSearchContentText = await this.pageService.searchContent(
        item.filename,
      )

      console.log('articleSearchCoverImage', articleSearchCoverImage)
      console.log('articleSearchContentText', articleSearchContentText)
      console.log('pageSearchContentText', pageSearchContentText)

      return (
        articleSearchCoverImage ||
        articleSearchContentText ||
        pageSearchContentText
      )
    } catch (err) {
      throw new ExceptionHelper(
        this.coreMessage.BAD_REQUEST,
        HttpStatus.BAD_REQUEST,
      )
    }
  }
}
