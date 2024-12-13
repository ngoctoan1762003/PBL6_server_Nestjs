import { Controller, Get, Post, Body, Delete, Param, Put, Query } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { Diary } from './diary.schema';
import { Date, Types } from 'mongoose';

@Controller('diary')
export class DiaryController {
    constructor(private readonly diaryService: DiaryService) {}

    @Post()
    async createDiary(@Body() createDiaryDto: CreateDiaryDto): Promise<Diary> {
        return this.diaryService.createDiary(createDiaryDto);
    }

    @Get()
    async getAllDiaries(): Promise<Diary[]> {
        return this.diaryService.getAllDiaries();
    }

    @Get('day')
    async getDiaryByDay(@Query('day') day: string): Promise<any> {
        const parsedDate = new Date(day);
    
        if (isNaN(parsedDate.getTime())) {
            throw new Error("Invalid date object");
        }
    
        return this.diaryService.getDiaryByDate(parsedDate);
    }
    

    @Get(':id')
    async getDiaryById(@Param('id') id: string): Promise<Diary> {
        return this.diaryService.getDiaryById(id);
    }

    @Put(':id')
    async updateDiary(
        @Param('id') id: string,
        @Body() updateDiaryDto: UpdateDiaryDto,
    ): Promise<Diary> {
        return this.diaryService.updateDiary(id, updateDiaryDto);
    }

    @Delete(':id')
    async deleteDiary(@Param('id') id: string): Promise<void> {
        return this.diaryService.deleteDiary(id);
    }
}
