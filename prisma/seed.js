const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const initialQuestions = [
  {
    title: "2024 Tech Trends",
    description: "What will be the most impactful technology in 2024?",
    options: JSON.stringify(["AI", "Quantum Computing", "AR/VR", "Blockchain"]),
    votes: JSON.stringify({
      "AI": 0,
      "Quantum Computing": 0,
      "AR/VR": 0,
      "Blockchain": 0
    }),
    order: 0
  },
  {
    title: "Future of Work",
    description: "How will most people work in 2025?",
    options: JSON.stringify(["Remote", "Hybrid", "Office", "AI-Assisted"]),
    votes: JSON.stringify({
      "Remote": 0,
      "Hybrid": 0,
      "Office": 0,
      "AI-Assisted": 0
    }),
    order: 1
  }
];

async function main() {
  console.log('Start seeding...');
  
  // Clear existing data
  await prisma.question.deleteMany();
  
  // Insert initial questions
  for (const question of initialQuestions) {
    const result = await prisma.question.create({
      data: question
    });
    console.log(`Created question with id: ${result.id}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });