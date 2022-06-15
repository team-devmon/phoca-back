import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import * as AWS from "aws-sdk";
import * as dotenv from "dotenv";
import { Repository } from "typeorm";
import { CreateWordDto } from "./dto/create-word.dto";
import { UpdateWordDto } from "./dto/update-word.dto";
import { Word } from "./word.entity";
dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_BUCKET_REGION,
});

@Injectable()
export class WordService {
  constructor(
    @InjectRepository(Word) private wordRepository: Repository<Word>,
  ) {}
  s3 = new AWS.S3();

  async uploadWord(
    file: Express.Multer.File,
    createWordDto: CreateWordDto,
    wordbookId: string,
  ) {
    const AWS_S3_BUCKET = process.env.AWS_BUCKET_NAME;
    const params = {
      Bucket: AWS_S3_BUCKET,
      Key: String(file.originalname),
      Body: file.buffer,
      ACL: "public-read",
    };
    try {
      const response = await this.s3.upload(params).promise();
      console.log(response);
      const { wordEng, wordKor } = createWordDto;
      const wordImage = response.Location;
      const newWord = this.wordRepository.create({
        wordEng,
        wordKor,
        wordImage,
        // wordbookId,
      });
      return await this.wordRepository.save(newWord);
    } catch (e) {
      console.log(e);
    }
  }

  async deleteWord(wordId: string) {
    const word = await this.wordRepository.findOne({ where: { wordId } });
    if (!word) {
      throw new NotFoundException("word not found");
    }
    return this.wordRepository.remove(word);
    //   const key = word.key
    //   const response = await this.s3
    //     .deleteObject({
    //       Bucket: process.env.AWS_BUCKET_NAME,
    //       Key: key,
    //     })
    //     .promise();
    //   console.log(response);
    //   return response;
    // }
    // catch(e) {
    //   console.log(e);
    // }
  }
  async create(wordbookId, createWordDto: CreateWordDto) {
    const data = { ...createWordDto, wordbookId };
    const word = this.wordRepository.create(data);
    return await this.wordRepository.save(word);
  }

  async getAll(wordbookId) {
    const wordbook = await this.wordRepository.find({
      where: { wordbookId },
    });
    return wordbook;
  }

  async get(wordId: string) {
    const word = await this.wordRepository.findOne({
      where: { wordId },
    });
    return word;
  }

  async update(wordId: string, updateWordDto: UpdateWordDto) {
    const word = await this.wordRepository.findOne({ where: { wordId } });
    if (!word) {
      throw new NotFoundException("word not found");
    }
    Object.assign(word, updateWordDto);
    return this.wordRepository.save(word);
  }
  //   return await this.wordRepository.find({ relations: { wordbook: true } });
  // }
}
