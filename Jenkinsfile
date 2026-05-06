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
            description: 'Dev env credentials'
        )
        string(
            name: 'PROD_ENV_CREDENTIALS_ID',
            defaultValue: 'react-node-ci-env-prod',
            description: 'Prod env credentials'
        )
    }

    environment {
        DEV_COMPOSE_FILE = 'docker-compose.ci.dev.yml'
        PROD_COMPOSE_FILE = 'docker-compose.prod.yml'
        PROD_BUILD_COMPOSE_FILE = 'docker-compose.build.yml'

        EC2_HOST = "ubuntu@13.233.215.134"
      
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

                    env.BUILD_COMPOSE_FILE = params.TARGET_ENV == 'prod'
                        ? env.PROD_BUILD_COMPOSE_FILE
                        : env.DEV_COMPOSE_FILE

                    def shortCommit = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    env.IMAGE_TAG = params.TARGET_ENV == 'prod'
                        ? "prod-${env.BUILD_NUMBER}-${shortCommit}"
                        : 'dev-local'

                    def envCredentialsId = params.TARGET_ENV == 'prod'
                        ? params.PROD_ENV_CREDENTIALS_ID
                        : params.DEV_ENV_CREDENTIALS_ID

                    if (sh(script: 'docker compose version >/dev/null 2>&1', returnStatus: true) == 0) {
                        env.COMPOSE_CMD = 'docker compose'
                    } else {
                        env.COMPOSE_CMD = 'docker-compose'
                    }

                    withCredentials([file(credentialsId: envCredentialsId, variable: 'APP_ENV_FILE')]) {
                        sh '''
                            cp "${APP_ENV_FILE}" .env
                        '''
                    }

                    echo "Target: ${params.TARGET_ENV}"
                    echo "Image tag: ${env.IMAGE_TAG}"
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

                ${COMPOSE_CMD} -f "${BUILD_COMPOSE_FILE}" build ${CACHE_FLAG}
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
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                    ${COMPOSE_CMD} -f "${BUILD_COMPOSE_FILE}" push
                    '''
                }
            }
        }

  stage('Deploy') {
    steps {
        withCredentials([file(credentialsId: 'ec2-key', variable: 'KEY')]) {
            sh '''
            echo "Deploying to EC2..."

            ssh -i $KEY -o StrictHostKeyChecking=no ubuntu@13.233.215.134 << 'EOF'

            set -e

            mkdir -p /home/ubuntu/app
            cd /home/ubuntu/app

            docker compose down -v --remove-orphans || true
            docker compose up -d

            docker ps

            EOF
            '''
        }
    }
}

        stage('Health Check') {
    steps {
        sh '''
        echo "Running health check..."

        ssh -i ${EC2_KEY} -o StrictHostKeyChecking=no ${EC2_HOST} << EOF

        set -e

        if [ "$TARGET_ENV" = "prod" ]; then
          for i in $(seq 1 10); do
            curl -f http://localhost/api && curl -f http://localhost/ && exit 0
            sleep 3
          done
          exit 1
        else
          curl -f http://localhost:5000/api && curl -f http://localhost:3000/ && exit 0
        fi

        EOF
        '''
    }
}
    }

    post {
        success {
            echo "Deployment Successful"
        }
        failure {
            echo "Deployment Failed"
        }
    }
}