import {
  Column,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
} from "typeorm";
import { Wordbook } from "../wordbook/wordbook.entity";

@Index("word_pkey", ["word_Id"], { unique: true })
@Entity("word", { schema: "public" })
export class Word {
  @Column("uuid", { primary: true, name: "word_id" })
  @Generated("uuid")
  wordId: string;

  @Column("character varying", { name: "word_eng", length: 45 })
  wordEng: string;

  @Column("character varying", { name: "word_kor", length: 20 })
  wordKor: string;

  @Column("character varying", { name: "word_image" })
  wordImage: string;

  @Column("uuid", { name: "wordbook_id" })
  wordbookId: string;

  @ManyToOne(() => Wordbook, (wordbook) => wordbook.word, {
    onDelete: "CASCADE",
    eager: true,
  })
  @JoinColumn([{ name: "wordbook_id", referencedColumnName: "wordbook_id" }])
  wordbook: Wordbook;
}