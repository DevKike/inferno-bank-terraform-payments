data "aws_iam_policy_document" "lambda_assume_role_policy" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "archive_file" "lambda_payment_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/handlers/payment"
  output_path = "${path.module}/dist/payment.zip"
}

data "aws_caller_identity" "current" {}

data "aws_iam_policy_document" "lambda_payment_policy_document" {
  version = "2012-10-17"


  statement {
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:UpdateItem",
      "dynamodb:Query",
      "dynamodb:Scan",
      "sqs:SendMessage",
      "sqs:SendMessageBatch",
      "sqs:ReceiveMessage",
      "sqs:DeleteMessage",
      "sqs:GetQueueAttributes",
      "sqs:ChangeMessageVisibility"
    ]

    resources = ["arn:aws:dynamodb:${var.app_region}:${data.aws_caller_identity.current.account_id}:table/${var.card_table_name}", var.start_payment_sqs_arn, var.check_balance_sqs_arn, "arn:aws:dynamodb:${var.app_region}:${data.aws_caller_identity.current.account_id}:table/${var.payments_table_name}", var.check_balance_sqs_arn, var.transactions_sqs_arn]
  }
}

data "archive_file" "lambda_start_payment_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/handlers/start-payment"
  output_path = "${path.module}/dist/start-payment.zip"
}

data "archive_file" "lambda_check_balance_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/handlers/check-balance"
  output_path = "${path.module}/dist/check-balance.zip"
}

data "archive_file" "lambda_transaction_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/handlers/transaction"
  output_path = "${path.module}/dist/transaction.zip"
}

data "archive_file" "lambda_get_status_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../dist/handlers/get-status"
  output_path = "${path.module}/dist/get-status.zip"
}
