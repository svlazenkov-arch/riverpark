import { db } from "./db";
import { 
  apartments, 
  bills, 
  news, 
  documents, 
  votings, 
  votingOptions,
  serviceRequests,
  notifications 
} from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Create apartments
  const [apt1] = await db.insert(apartments).values({
    number: "45",
    entrance: 3,
    floor: 5,
    area: "65.5"
  }).returning();

  const [apt2] = await db.insert(apartments).values({
    number: "46",
    entrance: 3,
    floor: 5,
    area: "72.0"
  }).returning();

  console.log("Created apartments:", apt1.id, apt2.id);

  // Create bills
  await db.insert(bills).values([
    {
      apartmentId: apt1.id,
      month: "Декабрь",
      year: 2024,
      amount: "5420.00",
      status: "unpaid",
      dueDate: new Date("2025-01-10"),
      details: {
        electricity: 1200,
        coldWater: 450,
        hotWater: 890,
        heating: 2100,
        maintenance: 780
      }
    },
    {
      apartmentId: apt1.id,
      month: "Ноябрь",
      year: 2024,
      amount: "5180.00",
      status: "paid",
      dueDate: new Date("2024-12-10"),
      paidAt: new Date("2024-12-05"),
      details: {
        electricity: 1150,
        coldWater: 420,
        hotWater: 850,
        heating: 2000,
        maintenance: 760
      }
    },
    {
      apartmentId: apt1.id,
      month: "Октябрь",
      year: 2024,
      amount: "4950.00",
      status: "paid",
      dueDate: new Date("2024-11-10"),
      paidAt: new Date("2024-11-08"),
      details: {
        electricity: 1100,
        coldWater: 400,
        hotWater: 800,
        heating: 1900,
        maintenance: 750
      }
    }
  ]);

  console.log("Created bills");

  // Create news
  await db.insert(news).values([
    {
      title: "Новогоднее украшение двора",
      excerpt: "Уважаемые жители! С 20 декабря начнется установка новогодних украшений на территории комплекса.",
      content: "Уважаемые жители ЖК River Park! Сообщаем вам, что с 20 декабря 2024 года начнутся работы по установке новогодних украшений на территории нашего жилого комплекса. Будут установлены световые гирлянды, новогодняя елка и праздничные композиции. Работы будут проводиться в дневное время и не должны причинить неудобств жителям.",
      authorId: "admin",
      views: 234
    },
    {
      title: "Плановое отключение воды",
      excerpt: "18 декабря с 9:00 до 14:00 будет произведено плановое отключение холодной воды.",
      content: "Уважаемые жители! 18 декабря 2024 года с 9:00 до 14:00 будет произведено плановое отключение холодной воды для проведения профилактических работ на водопроводных сетях. Просим заранее запастись водой. Приносим извинения за доставленные неудобства.",
      authorId: "admin",
      views: 567
    },
    {
      title: "Новые правила парковки",
      excerpt: "С 1 января 2025 года вводятся новые правила парковки на территории ЖК.",
      content: "Уважаемые жители! С 1 января 2025 года на территории ЖК River Park вводятся новые правила парковки. Парковка будет разрешена только на специально отведенных местах. За нарушение правил парковки будет взиматься штраф. Подробности в приложенных документах.",
      authorId: "admin",
      views: 445
    }
  ]);

  console.log("Created news");

  // Create documents
  await db.insert(documents).values([
    {
      title: "Протокол общего собрания от 15.11.2024",
      description: "Протокол общего собрания собственников помещений",
      fileUrl: "/documents/protocol-2024-11-15.pdf",
      fileType: "PDF",
      fileSize: 2457600,
      category: "Протоколы",
      uploadedBy: "admin",
      isPublic: true
    },
    {
      title: "Правила внутреннего распорядка ЖК River Park",
      description: "Правила проживания и использования общего имущества",
      fileUrl: "/documents/rules.pdf",
      fileType: "PDF",
      fileSize: 1887436,
      category: "Правила",
      uploadedBy: "admin",
      isPublic: true
    },
    {
      title: "Акт сверки за 2024 год",
      description: "Акт сверки расчетов за коммунальные услуги",
      fileUrl: "/documents/act-2024.pdf",
      fileType: "PDF",
      fileSize: 870400,
      category: "Финансовые документы",
      uploadedBy: "admin",
      isPublic: true
    }
  ]);

  console.log("Created documents");

  // Create voting
  const [voting1] = await db.insert(votings).values({
    title: "Благоустройство детской площадки",
    description: "Выберите вариант оборудования для новой детской площадки",
    status: "active",
    deadline: new Date("2024-12-25"),
    createdBy: "admin"
  }).returning();

  await db.insert(votingOptions).values([
    {
      votingId: voting1.id,
      text: "Качели и горка",
      displayOrder: 0
    },
    {
      votingId: voting1.id,
      text: "Спортивный комплекс",
      displayOrder: 1
    },
    {
      votingId: voting1.id,
      text: "Песочница и домик",
      displayOrder: 2
    }
  ]);

  const [voting2] = await db.insert(votings).values({
    title: "Установка камер видеонаблюдения",
    description: "Согласны ли вы с установкой дополнительных камер на территории?",
    status: "active",
    deadline: new Date("2024-12-30"),
    createdBy: "admin"
  }).returning();

  await db.insert(votingOptions).values([
    {
      votingId: voting2.id,
      text: "Да, поддерживаю",
      displayOrder: 0
    },
    {
      votingId: voting2.id,
      text: "Нет, против",
      displayOrder: 1
    }
  ]);

  console.log("Created votings");

  console.log("Seeding completed!");
}

seed().catch(console.error).finally(() => process.exit());
