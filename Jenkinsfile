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
        stage('Prepare Env') {
            steps {
                sh '''
                    if docker compose version >/dev/null 2>&1; then
                      COMPOSE_BIN="docker compose"
                    elif command -v docker-compose >/dev/null 2>&1; then
                      COMPOSE_BIN="docker-compose"
                    else
                      echo "ERROR: neither 'docker compose' nor 'docker-compose' is available"
                      exit 1
                    fi

                    if [ "${TARGET_ENV}" = "prod" ]; then
                      if [ -f ".env.prod.example" ]; then
                        cp .env.prod.example .env.prod
                      elif [ ! -f ".env.prod" ]; then
                        cat > .env.prod << 'EOF'
NODE_ENV=production
PORT=5000
DB_URL=mongodb://mongo-prod:27017/proddb
PUBLIC_URL=/
EOF
                      fi
                      COMPOSE_FILE_NAME="${COMPOSE_PROD}"
                    else
                      if [ -f ".env.dev.example" ]; then
                        cp .env.dev.example .env.dev
                      elif [ ! -f ".env.dev" ]; then
                        cat > .env.dev << 'EOF'
NODE_ENV=development
PORT=5000
DB_URL=mongodb://mongo-dev:27017/devdb
CHOKIDAR_USEPOLLING=true
WDS_SOCKET_PORT=0
EOF
                      fi
                      COMPOSE_FILE_NAME="${COMPOSE_DEV}"
                    fi
                    echo "Compose command: ${COMPOSE_BIN}"
                    echo "Using compose file: ${COMPOSE_FILE_NAME}"
                '''
            }
        }

        stage('Cleanup') {
            steps {
                sh '''
                    if docker compose version >/dev/null 2>&1; then
                      COMPOSE_BIN="docker compose"
                    else
                      COMPOSE_BIN="docker-compose"
                    fi
                    if [ "${TARGET_ENV}" = "prod" ]; then
                      ${COMPOSE_BIN} -f "${COMPOSE_PROD}" down -v --remove-orphans 2>/dev/null || true
                    else
                      ${COMPOSE_BIN} -f "${COMPOSE_DEV}" down -v --remove-orphans 2>/dev/null || true
                    fi
                '''
            }
        }

        stage('Build Images') {
            steps {
                sh '''
                    if docker compose version >/dev/null 2>&1; then
                      COMPOSE_BIN="docker compose"
                    else
                      COMPOSE_BIN="docker-compose"
                    fi
                    CACHE_FLAG=""
                    if [ "${NO_CACHE}" = "true" ]; then
                      CACHE_FLAG="--no-cache"
                    fi

                    if [ "${TARGET_ENV}" = "prod" ]; then
                      ${COMPOSE_BIN} -f "${COMPOSE_PROD}" build ${CACHE_FLAG}
                    else
                      ${COMPOSE_BIN} -f "${COMPOSE_DEV}" build ${CACHE_FLAG}
                    fi
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    if docker compose version >/dev/null 2>&1; then
                      COMPOSE_BIN="docker compose"
                    else
                      COMPOSE_BIN="docker-compose"
                    fi
                    if [ "${TARGET_ENV}" = "prod" ]; then
                      ${COMPOSE_BIN} -f "${COMPOSE_PROD}" up -d
                    else
                      DEV_FRONTEND_PORT=18081 DEV_BACKEND_PORT=15000 DEV_MONGO_PORT=37017 \
                        ${COMPOSE_BIN} -f "${COMPOSE_DEV}" up -d
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
                if docker compose version >/dev/null 2>&1; then
                  COMPOSE_BIN="docker compose"
                else
                  COMPOSE_BIN="docker-compose"
                fi
                if [ "${TARGET_ENV}" = "prod" ]; then
                  ${COMPOSE_BIN} -f "${COMPOSE_PROD}" logs || true
                else
                  ${COMPOSE_BIN} -f "${COMPOSE_DEV}" logs || true
                fi
            '''
        }
    }
}
