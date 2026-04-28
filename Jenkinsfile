pipeline {
    agent any

    parameters {
        choice(
            name: 'TARGET_ENV',
            choices: ['dev', 'prod'],
            description: 'Select which stack to deploy'
        )
        booleanParam(
            name: 'NO_CACHE',
            defaultValue: true,
            description: 'Build Docker images with --no-cache'
        )
    }

    environment {
        COMPOSE_DEV = 'docker-compose.dev.yml'
        COMPOSE_PROD = 'docker-compose.prod.yml'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Env') {
            steps {
                sh '''
                    if [ "${TARGET_ENV}" = "prod" ]; then
                      cp .env.prod.example .env.prod
                      COMPOSE_FILE_NAME="${COMPOSE_PROD}"
                    else
                      cp .env.dev.example .env.dev
                      COMPOSE_FILE_NAME="${COMPOSE_DEV}"
                    fi
                    echo "Using compose file: ${COMPOSE_FILE_NAME}"
                '''
            }
        }

        stage('Cleanup') {
            steps {
                sh '''
                    if [ "${TARGET_ENV}" = "prod" ]; then
                      docker compose -f "${COMPOSE_PROD}" down -v --remove-orphans 2>/dev/null || true
                    else
                      docker compose -f "${COMPOSE_DEV}" down -v --remove-orphans 2>/dev/null || true
                    fi
                '''
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                    CACHE_FLAG=""
                    if [ "${NO_CACHE}" = "true" ]; then
                      CACHE_FLAG="--no-cache"
                    fi

                    if [ "${TARGET_ENV}" = "prod" ]; then
                      docker compose -f "${COMPOSE_PROD}" build ${CACHE_FLAG}
                    else
                      docker compose -f "${COMPOSE_DEV}" build ${CACHE_FLAG}
                    fi
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    if [ "${TARGET_ENV}" = "prod" ]; then
                      docker compose -f "${COMPOSE_PROD}" up -d
                    else
                      docker compose -f "${COMPOSE_DEV}" up -d
                    fi
                    sleep 10
                '''
            }
        }

        stage('Verify') {
            steps {
                sh "docker ps"
            }
        }
    }

    post {
        success {
            echo "Deployment Successful 🚀"
        }
        failure {
            echo "Deployment Failed ❌"
            sh '''
                if [ "${TARGET_ENV}" = "prod" ]; then
                  docker compose -f "${COMPOSE_PROD}" logs || true
                else
                  docker compose -f "${COMPOSE_DEV}" logs || true
                fi
            '''
        }
    }
}
