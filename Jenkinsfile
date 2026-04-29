pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

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
        booleanParam(
            name: 'PUSH_TO_DOCKERHUB',
            defaultValue: false,
            description: 'Push prod images to Docker Hub'
        )
        string(
            name: 'DOCKERHUB_CREDENTIALS_ID',
            defaultValue: 'dockerhub',
            description: 'Jenkins credentials ID for Docker Hub'
        )
        string(
            name: 'DOCKERHUB_NAMESPACE',
            defaultValue: 'maharshi86',
            description: 'Docker Hub namespace/user'
        )
        string(
            name: 'DEV_ENV_CREDENTIALS_ID',
            defaultValue: 'react-node-ci-env-dev',
            description: 'Jenkins secret text credentials ID for dev env'
        )
        string(
            name: 'PROD_ENV_CREDENTIALS_ID',
            defaultValue: 'react-node-ci-env-prod',
            description: 'Jenkins secret text credentials ID for prod env'
        )
    }

    environment {
        DEV_COMPOSE_FILE = 'docker-compose.ci.dev.yml'
        PROD_COMPOSE_FILE = 'docker-compose.prod.yml'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare') {
            steps {
                script {
                    env.COMPOSE_FILE = params.TARGET_ENV == 'prod'
                        ? env.PROD_COMPOSE_FILE
                        : env.DEV_COMPOSE_FILE

                    env.ENV_FILE = params.TARGET_ENV == 'prod'
                        ? '.env.prod'
                        : '.env.dev'

                    def envCredentialsId = params.TARGET_ENV == 'prod'
                        ? params.PROD_ENV_CREDENTIALS_ID
                        : params.DEV_ENV_CREDENTIALS_ID

                    if (sh(script: 'docker compose version >/dev/null 2>&1', returnStatus: true) == 0) {
                        env.COMPOSE_CMD = 'docker compose'
                    } else if (sh(script: 'command -v docker-compose >/dev/null 2>&1', returnStatus: true) == 0) {
                        env.COMPOSE_CMD = 'docker-compose'
                    } else {
                        error("Neither docker compose nor docker-compose is available")
                    }

                    withCredentials([string(credentialsId: envCredentialsId, variable: 'APP_ENV_CONTENT')]) {
                        writeFile file: env.ENV_FILE, text: APP_ENV_CONTENT.trim() + '\n'
                    }

                    echo "Target environment: ${params.TARGET_ENV}"
                    echo "Compose file: ${env.COMPOSE_FILE}"
                    echo "Compose command: ${env.COMPOSE_CMD}"
                }
            }
        }

        stage('Build') {
            steps {
                sh '''
                    CACHE_FLAG=""
                    if [ "${NO_CACHE}" = "true" ]; then
                      CACHE_FLAG="--no-cache"
                    fi

                    ${COMPOSE_CMD} -f "${COMPOSE_FILE}" build ${CACHE_FLAG}
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    ${COMPOSE_CMD} -f "${COMPOSE_FILE}" down -v --remove-orphans 2>/dev/null || true

                    if [ "${TARGET_ENV}" = "prod" ]; then
                      ${COMPOSE_CMD} -f "${COMPOSE_FILE}" up -d
                    else
                      DEV_FRONTEND_PORT=18081 DEV_BACKEND_PORT=15000 DEV_MONGO_PORT=37017 \
                        ${COMPOSE_CMD} -f "${COMPOSE_FILE}" up -d
                    fi

                    sleep 10
                '''
            }
        }

        stage('Push Images') {
            when {
                expression { params.TARGET_ENV == 'prod' && params.PUSH_TO_DOCKERHUB }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: params.DOCKERHUB_CREDENTIALS_ID,
                    usernameVariable: 'DOCKERHUB_USER',
                    passwordVariable: 'DOCKERHUB_PASS'
                )]) {
                    sh '''
                        echo "${DOCKERHUB_PASS}" | docker login -u "${DOCKERHUB_USER}" --password-stdin
                        docker push ${DOCKERHUB_NAMESPACE}/react-node-ci-backend:prod-latest
                        docker push ${DOCKERHUB_NAMESPACE}/react-node-ci-frontend:prod-latest
                        docker push ${DOCKERHUB_NAMESPACE}/react-node-ci-nginx:prod-latest
                        docker logout || true
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    docker ps

                    if [ "${TARGET_ENV}" = "prod" ]; then
                      curl -fsS http://localhost/api >/dev/null
                      curl -fsS http://localhost/ >/dev/null
                    else
                      curl -fsS http://localhost:15000/api >/dev/null
                      curl -fsS http://localhost:18081/ >/dev/null
                    fi
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployment Successful'
        }
        failure {
            echo 'Deployment Failed'
            sh '''
                if [ -n "${COMPOSE_CMD}" ] && [ -n "${COMPOSE_FILE}" ]; then
                  ${COMPOSE_CMD} -f "${COMPOSE_FILE}" logs || true
                else
                  echo "Compose values are unavailable; skipping compose logs."
                fi
            '''
        }
    }
}
