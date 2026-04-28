pipeline {
    agent any

    parameters {
        choice(name: 'ENV', choices: ['dev', 'prod'], description: 'Select Environment')
    }

    environment {
        COMPOSE_PROJECT = "react-node-app"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/Maharshi08/react-node-ci-cd.git'
            }
        }

        stage('Stop Existing Stack (Avoid Port Conflict)') {
            steps {
                sh """
                docker compose down --remove-orphans || true
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
                docker compose up -d --force-recreate
                """
            }
        }

        stage('Verify Containers') {
            steps {
                sh """
                docker ps
                """
            }
        }
    }

    post {
        success {
            echo "Deployment Successful "
        }
        failure {
            echo "Deployment Failed "
        }
    }
}