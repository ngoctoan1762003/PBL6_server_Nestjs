import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Date, Model } from 'mongoose';
import { Diary } from './diary.schema';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';

@Injectable()
export class DiaryService {
    constructor(
        @InjectModel(Diary.name) private diaryModel: Model<Diary>,
    ) {}

    async createDiary(createDiaryDto: CreateDiaryDto): Promise<Diary> {
        // Ensure the `day` is stored with time set to 00:00:00.000 UTC
        const dayAsDate = new Date(createDiaryDto.day);
        dayAsDate.setUTCHours(0, 0, 0, 0);
    
        // Check if a diary already exists for the same day
        const existingDiary = await this.diaryModel.findOne({ day: dayAsDate });
    
        if (existingDiary) {
            // Remove the existing diary for the day
            await this.diaryModel.deleteOne({ _id: existingDiary._id });
        }
    
        // Create a new diary with the normalized `day`
        const createdDiary = new this.diaryModel({ ...createDiaryDto, day: dayAsDate });
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

    async getDiaryByDate(date: any): Promise<any> {
        if (!(date instanceof Date) || isNaN(date.getTime())) {
            throw new Error("Invalid date object");
        }
    
        const inputDateUTC = new Date(date);
    
        const startOfDay = new Date(inputDateUTC);
        startOfDay.setUTCHours(0, 0, 0, 0);
    
        const endOfDay = new Date(inputDateUTC);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const result = await this.diaryModel.findOne({
            day: { $gte: startOfDay, $lt: endOfDay },
        });
        
        return result;
    }
    
    
}
