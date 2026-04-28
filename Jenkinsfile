pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Cleanup') {
            steps {
                sh "docker-compose down -v --remove-orphans 2>/dev/null || true"
            }
        }

        stage('Build Images') {
            steps {
                sh "docker-compose build --no-cache"
            }
        }

        stage('Deploy') {
            steps {
                sh "docker-compose up -d && sleep 10"
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
            sh "docker-compose logs || true"
        }
    }
}
