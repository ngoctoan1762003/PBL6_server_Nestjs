import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Diary } from './diary.schema';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';

@Injectable()
export class DiaryService {
    constructor(
        @InjectModel(Diary.name) private diaryModel: Model<Diary>,
    ) {}

    async createDiary(createDiaryDto: CreateDiaryDto): Promise<Diary> {
        const createdDiary = new this.diaryModel(createDiaryDto);
        return createdDiary.save();
    }

    async getAllDiaries(): Promise<Diary[]> {
        return this.diaryModel.find().exec();
    }

    async getDiaryById(id: string): Promise<Diary> {
        const diary = await this.diaryModel.findById(id).exec();
        if (!diary) {
            throw new NotFoundException(`Diary with ID "${id}" not found`);
        }
        return diary;
    }

    async updateDiary(id: string, updateDiaryDto: UpdateDiaryDto): Promise<Diary> {
        const updatedDiary = await this.diaryModel.findByIdAndUpdate(id, updateDiaryDto, {
            new: true,
        }).exec();

        if (!updatedDiary) {
            throw new NotFoundException(`Diary with ID "${id}" not found`);
        }

        return updatedDiary;
    }

    async deleteDiary(id: string): Promise<void> {
        const result = await this.diaryModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Diary with ID "${id}" not found`);
        }
    }
}
