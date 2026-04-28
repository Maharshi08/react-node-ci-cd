pipeline {
    agent any

    parameters {
        choice(name: 'ENV', choices: ['dev', 'prod'], description: 'Select Environment')
    }

    environment {
        BACKEND_IMAGE = "backend"
        FRONTEND_IMAGE = "frontend"
        NETWORK = "app-network"
    }

    stages {

        stage('Prepare Network') {
            steps {
                sh '''
                docker network create $NETWORK || true
                '''
            }
        }

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Maharshi08/react-node-ci-cd.git'
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh "docker build -t ${BACKEND_IMAGE}:${params.ENV} ."
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh "docker build -t ${FRONTEND_IMAGE}:${params.ENV} ."
                }
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh '''
                docker stop backend-${ENV} || true
                docker rm backend-${ENV} || true
                docker stop frontend-${ENV} || true
                docker rm frontend-${ENV} || true
                '''
            }
        }

        stage('Run Backend') {
            steps {
                withCredentials([file(credentialsId: "backend-env-${params.ENV}", variable: 'ENV_FILE')]) {
                    sh '''
                    docker run -d \
                    --name backend-${ENV} \
                    --network $NETWORK \
                    -p 500${ENV == "dev" ? "0" : "1"}:5000 \
                    --env-file $ENV_FILE \
                    ${BACKEND_IMAGE}:${ENV}
                    '''
                }
            }
        }

        stage('Run Frontend') {
            steps {
                sh '''
                docker run -d \
                --name frontend-${ENV} \
                --network $NETWORK \
                -p ${ENV == "dev" ? "8081" : "8082"}:80 \
                ${FRONTEND_IMAGE}:${ENV}
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment Successful for ${ENV}"
        }
        failure {
            echo "Build Failed"
        }
    }
}