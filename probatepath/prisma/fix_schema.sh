#!/bin/bash
# Fix the Prisma schema by removing the problematic lines and adding correct ones
sed -i '74,76d' schema.prisma
sed -i '73a\  formsPackageGeneratedAt     DateTime?\n  formsPackageUrl             String?\n  formsGenerated              String[]\n}' schema.prisma
