resource "aws_iam_role" "lambda_execution" {
  name               = "lambda-payment-exec-role"
  assume_role_policy = data.aws_iam_policy_document.lambda_assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Init payment

resource "aws_iam_role_policy_attachment" "lambda_payment_vpc_access" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}


resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name   = "lambda-dynamodb-access"
  role   = aws_iam_role.lambda_execution.id
  policy = data.aws_iam_policy_document.lambda_payment_policy_document.json
}

resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id          = var.vpc_id
  service_name    = "com.amazonaws.${var.app_region}.dynamodb"
  route_table_ids = [var.public_route_table_id]
}

resource "aws_security_group_rule" "allow_lambda_to_sqs_endpoint" {
  type                     = "ingress"
  from_port                = 443
  to_port                  = 443
  protocol                 = "tcp"
  security_group_id        = var.security_group_id
  source_security_group_id = var.security_group_id
  description              = "Allow lambda to reach SQS interface endpoint"
}

resource "aws_vpc_endpoint" "sqs" {
  vpc_id              = var.vpc_id
  service_name        = "com.amazonaws.${var.app_region}.sqs"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = var.subnet_ids
  security_group_ids  = [var.security_group_id]
  private_dns_enabled = true
}

# Payment

resource "aws_lambda_function" "lambda_payment" {
  function_name    = "payment"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.lambda_payment_zip.output_path
  source_code_hash = data.archive_file.lambda_payment_zip.output_base64sha256
  timeout          = 30
  memory_size      = 256

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [var.security_group_id]
  }

  environment {
    variables = {
      APP_REGION              = var.app_region,
      CARD_TABLE_NAME         = var.card_table_name,
      START_PAYMENT_QUEUE_URL = var.start_payment_sqs_url
    }
  }
}

# Start payment

resource "aws_dynamodb_table" "payments" {
  name         = var.payments_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "traceId"

  attribute {
    name = "traceId"
    type = "S"
  }
}

resource "aws_lambda_function" "start_payment" {
  function_name    = "start-payment"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.lambda_start_payment_zip.output_path
  source_code_hash = data.archive_file.lambda_start_payment_zip.output_base64sha256
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      APP_REGION              = var.app_region
      PAYMENTS_TABLE_NAME     = var.payments_table_name
      CHECK_BALANCE_QUEUE_URL = var.check_balance_queue_url
    }
  }
}

resource "aws_lambda_event_source_mapping" "sqs_to_start_payment" {
  event_source_arn = var.start_payment_sqs_arn
  function_name    = aws_lambda_function.start_payment.arn
  batch_size       = 10
  enabled          = true
}

# Check balance
resource "aws_lambda_function" "check_balance" {
  function_name    = "check-balance"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.lambda_check_balance_zip.output_path
  source_code_hash = data.archive_file.lambda_check_balance_zip.output_base64sha256
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      APP_REGION             = var.app_region
      CARD_TABLE_NAME        = var.card_table_name
      PAYMENTS_TABLE_NAME    = var.payments_table_name
      TRANSACTIONS_QUEUE_URL = var.transactions_sqs_url
    }
  }
}

resource "aws_lambda_event_source_mapping" "sqs_to_check_balance" {
  event_source_arn = var.check_balance_sqs_arn
  function_name    = aws_lambda_function.check_balance.arn
  batch_size       = 10
  enabled          = true
}

# Transaction

resource "aws_lambda_function" "transaction" {
  function_name    = "transaction"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.lambda_transaction_zip.output_path
  source_code_hash = data.archive_file.lambda_transaction_zip.output_base64sha256
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      APP_REGION          = var.app_region
      CARD_TABLE_NAME     = var.card_table_name
      PAYMENTS_TABLE_NAME = var.payments_table_name
    }
  }
}

resource "aws_lambda_event_source_mapping" "sqs_to_transaction" {
  event_source_arn = var.transactions_sqs_arn
  function_name    = aws_lambda_function.transaction.arn
  batch_size       = 10
  enabled          = true
}

# Get status

resource "aws_lambda_function" "get_status" {
  function_name    = "get-status"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  filename         = data.archive_file.lambda_get_status_zip.output_path
  source_code_hash = data.archive_file.lambda_get_status_zip.output_base64sha256
  timeout          = 30
  memory_size      = 256

  environment {
    variables = {
      APP_REGION          = var.app_region
      PAYMENTS_TABLE_NAME = var.payments_table_name
    }
  }
}
