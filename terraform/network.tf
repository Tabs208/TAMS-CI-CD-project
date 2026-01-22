# -----------------------------------------------------------
# terraform/network.tf
# Defines the AWS VPC, Subnets, and Gateways (IGW)
# -----------------------------------------------------------

# 1. VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = {
    Name = "${var.project_name}-${var.environment}-vpc"
  }
}

# 2. Internet Gateway (for public access)
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags = {
    Name = "${var.project_name}-${var.environment}-igw"
  }
}

# Use two AZs as required by AWS Load Balancers
data "aws_availability_zones" "available" {
  state = "available"
}

# 3. Public Subnets (where ALB will live)
# --- Subnet 1 (AZ A) ---
resource "aws_subnet" "public_1" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[0]
  tags = {
    Name = "${var.project_name}-${var.environment}-public-subnet-1"
  }
}

# --- Subnet 2 (AZ B - FIX for Load Balancer) ---
resource "aws_subnet" "public_2" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.3.0/24" # New CIDR block to avoid overlap
  map_public_ip_on_launch = true
  availability_zone       = data.aws_availability_zones.available.names[1]
  tags = {
    Name = "${var.project_name}-${var.environment}-public-subnet-2"
  }
}

# 4. Private Subnets (where Fargate tasks will live)
# --- Subnet 1 (AZ A) ---
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = data.aws_availability_zones.available.names[0]
  tags = {
    Name = "${var.project_name}-${var.environment}-private-subnet-1"
  }
}

# --- Subnet 2 (AZ B - Best practice for Fargate) ---
resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.4.0/24" # New CIDR block to avoid overlap
  availability_zone = data.aws_availability_zones.available.names[1]
  tags = {
    Name = "${var.project_name}-${var.environment}-private-subnet-2"
  }
}

# 5. Public Route Table
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
}

# 6. Associate Public Route Table
resource "aws_route_table_association" "public_1" {
  subnet_id      = aws_subnet.public_1.id
  route_table_id = aws_route_table.public.id
}

# 6. Associate Public Route Table (Second AZ)
resource "aws_route_table_association" "public_2" {
  subnet_id      = aws_subnet.public_2.id
  route_table_id = aws_route_table.public.id
}