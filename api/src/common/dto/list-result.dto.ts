import { ApiProperty } from '@nestjs/swagger'

export class ListResultDto {
  @ApiProperty({
    description: 'Total item results',
  })
  totalResults: number

  @ApiProperty({
    description: 'Total pages',
  })
  totalPages: number

  @ApiProperty({
    description: 'Page size',
  })
  pageSize: number

  @ApiProperty({
    description: 'Current page',
  })
  currentPage: number

  @ApiProperty({
    description: 'Current page size',
  })
  currentPageSize: number

  @ApiProperty({
    description: 'Items',
    type: Object,
  })
  results: Object
}
