# -----------------------------------------------------------
# terraform/alb.tf
# Defines the Application Load Balancer and Target Groups (AZ FIX APPLIED)
# -----------------------------------------------------------

# 1. ALB Security Group
resource "aws_security_group" "alb_sg" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "Controls access to the ALB"
  vpc_id      = aws_vpc.main.id

  # Ingress: Allow HTTP traffic from everywhere
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Egress: Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 2. Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  
  # FIX: Must reference both public subnets (AZ 1 and AZ 2)
  subnets            = [aws_subnet.public_1.id, aws_subnet.public_2.id] 

  enable_deletion_protection = false
  tags = {
    Name = "${var.project_name}-${var.environment}-alb"
  }
}

# 3. Target Group for Frontend (React/Nginx on port 80)
resource "aws_lb_target_group" "frontend" {
  name        = "${var.project_name}-${var.environment}-frontend-tg"
  port        = 80
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip" # ECS Fargate uses IP targets
  health_check {
    path                = "/"
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# 4. Target Group for Backend (Flask on port 5000)
resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-${var.environment}-backend-tg"
  port        = 5000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.main.id
  target_type = "ip" # ECS Fargate uses IP targets
  health_check {
    path                = "/health" # Assumes your Flask app has a health check route
    protocol            = "HTTP"
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

# 5. ALB Listener (Receives HTTP traffic on port 80)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  # Default action: Route everything to the Frontend Target Group
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.frontend.arn
  }
}

# 6. Listener Rule for Backend API traffic (e.g., /api/*)
resource "aws_lb_listener_rule" "backend_api" {
  listener_arn = aws_lb_listener.http.arn
  priority     = 10 # Lower number means higher priority

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }

  condition {
    path_pattern {
      values = ["/api/*"] # Forward any request path starting with /api/ to the backend
    }
  }
}