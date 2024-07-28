import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { ArticleController } from '@/article/article.controller'

import { ArticleService } from '@/article/article.service'
import { TagService } from '@/tag/tag.service'
import { PageService } from '@/page/page.service'

import { Article, ArticleSchema } from '@/article/schemas/article.schema'
import { Tag, TagSchema } from '@/tag/schemas/tag.schema'

import { Page, PageSchema } from '@/page/schemas/page.schema'

import { CoreMessage, ArticleMessage } from '@/common/messages'
import { ExceptionHelper } from '@/common/helpers/exception.helper'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Article.name, schema: ArticleSchema }]),
    MongooseModule.forFeature([{ name: Tag.name, schema: TagSchema }]),
    MongooseModule.forFeature([{ name: Page.name, schema: PageSchema }]),
  ],
  controllers: [ArticleController],
  providers: [
    CoreMessage,
    ArticleMessage,
    ExceptionHelper,
    ArticleService,
    TagService,
    PageService,
  ],
})
export class ArticleModule {}
