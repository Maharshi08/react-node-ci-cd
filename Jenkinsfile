pipeline {
    agent any

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Maharshi08/react-node-ci-cd.git'
            }
        }

        stage('Verify Code Pulled') {
            steps {
                sh 'ls -la'
            }
        }

        stage('Docker Login Test') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-cred',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "Logging into Docker Hub..."
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    '''
                }
            }
        }

    }

    post {
        success {
            echo "Git checkout & Docker login SUCCESS"
        }
        failure {
            echo "Something failed - check logs"
        }
    }
}
