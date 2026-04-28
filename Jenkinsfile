pipeline {
    agent any

    parameters {
        choice(name: 'ENV', choices: ['dev', 'prod'], description: 'Select Environment')
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Maharshi08/react-node-ci-cd.git'
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh "docker build -t backend:${params.ENV} ."
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh "docker build -t frontend:${params.ENV} ."
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
                sh '''
                    docker run -d \
                    --name backend-${ENV} \
                    --network app-network \
                    -p 5000:5000 \
                    --env-file backend/.env.${ENV} \
                    backend:${ENV}
                '''
            }
        }

        stage('Run Frontend') {
            steps {
                sh '''
                    docker run -d \
                    --name frontend-${ENV} \
                    --network app-network \
                    -p 80:80 \
                    frontend:${ENV}
                '''
            }
        }
    }

    post {
        success {
            echo "Deployment Successful"
        }
        failure {
            echo "Build Failed"
        }
    }
}