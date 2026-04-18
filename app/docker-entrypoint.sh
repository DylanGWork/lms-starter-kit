#!/bin/sh
set -e

echo "Pushing database schema..."
node node_modules/prisma/build/index.js db push --accept-data-loss --skip-generate

echo "Checking if seed is needed..."
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  if (count === 0) {
    console.log('Database is empty, running seed...');
    process.exit(1);
  } else {
    console.log('Database already seeded (' + count + ' users found)');
    process.exit(0);
  }
}).catch(() => process.exit(1));
" || node node_modules/prisma/build/index.js db seed

echo "Starting application..."
exec node server.js
