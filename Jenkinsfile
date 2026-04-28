pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Maharshi08/react-node-ci-cd.git'
            }
        }

        stage('Stop Stack') {
            steps {
                sh """
                docker compose down || true
                """
            }
        }

        stage('Build Images') {
            steps {
                sh """
                docker compose build
                """
            }
        }

        stage('Deploy') {
            steps {
                sh """
                docker compose up -d
                """
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
        }
    }
}