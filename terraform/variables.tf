variable "app_region" {
  description = "AWS region to deploy resources"
  type        = string
  sensitive   = true
}

variable "aws_access_key" {
  description = "IAM AWS's access key"
  type        = string
  sensitive   = true
}

variable "aws_secret_key" {
  description = "IAM AWS's secret key"
  type        = string
  sensitive   = true
}

variable "vpc_id" {
  description = "VPC id for lambdas"
  type        = string
}

variable "subnet_ids" {
  description = "Subnet list ids"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group id for lambdas"
  type        = string
}

variable "card_table_name" {
  description = "Card table name for dynamodb provider logic"
  type        = string
}

variable "public_route_table_id" {
  description = "VPC public route table id for dynamodb provider logic"
  type        = string
}

variable "private_route_table_id" {
  description = "VPC private route table id for dynamodb provider logic"
  type        = string
}

variable "start_payment_sqs_arn" {
  description = "Start payment SQS ARN for Start payment lambda integration"
  type        = string
}

variable "start_payment_sqs_url" {
  description = "Start payment SQS URL for Start payment lambda integration"
  type        = string
}

variable "payments_table_name" {
  description = "Payments table name for dynamodb provider logic"
  type        = string
}

variable "check_balance_sqs_arn" {
  description = "Start payment SQS ARN for Check balance lambda integration"
}

variable "check_balance_queue_url" {
  description = "Check balance SQS URL for Check balance lambda integration"
  type        = string
}

variable "transactions_sqs_arn" {
  description = "Transaction SQS ARN for transaction lambda integration"
  type        = string
}

variable "transactions_sqs_url" {
  description = "Transaction SQS ARN for transaction lambda integration"
  type        = string
}
