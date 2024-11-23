#!/bin/sh

# Define colors for output
red=`tput setaf 1`
green=`tput setaf 2`
cyan=`tput setaf 6`
reset=`tput sgr0`

# Navigate to test-network directory
cd ../test-network || { echo "${red}Failed to navigate to test-network directory. Exiting.${reset}"; exit 1; }
tn=$(pwd)
echo "${green}Test Network Path: $tn${reset}"

# Prompt the user for the task
read -p "${cyan}Do you want to start the network? y/n: ${reset}" task

if [ "$task" = "y" ]; then 
    # Delete the wallet directory in the server
    cd $tn/../rec/server || { echo "${red}Failed to navigate to server directory. Exiting.${reset}"; exit 1; }
    echo "${red}Deleting Wallet from application-javascript${reset}"
    rm -rf wallet
    if [ $? -eq 0 ]; then
        echo "${green}Wallet deleted successfully.${reset}"
    else
        echo "${red}Failed to delete wallet.${reset}"
    fi

    # Shut down the existing network
    cd $tn || { echo "${red}Failed to navigate to test-network directory. Exiting.${reset}"; exit 1; }
    echo "${red}Shutting down existing network${reset}"
    ./network.sh down
    if [ $? -eq 0 ]; then
        echo "${green}Network shut down successfully.${reset}"
    else
        echo "${red}Failed to shut down the network.${reset}"
        exit 1
    fi

    # Start the network
    echo "${green}Starting Network${reset}"
    ./network.sh createChannel -ca -c mychannel -s couchdb
    if [ $? -eq 0 ]; then
        echo "${green}Network started successfully.${reset}"
    else
        echo "${red}Failed to start the network.${reset}"
        exit 1
    fi

    # Deploy the chaincode
    cd $tn/../rec/chaincode || { echo "${red}Failed to navigate to chaincode directory. Exiting.${reset}"; exit 1; }
    ccp=$(pwd)
    cd $tn || { echo "${red}Failed to navigate back to test-network directory. Exiting.${reset}"; exit 1; }
    echo -e "${green}Deploying chaincode...\nChaincode Name: basic\nChaincode Language: typescript\nChaincode Path: $ccp${reset}"
    ./network.sh deployCC -ccn basic -ccp $ccp -ccl typescript
    if [ $? -eq 0 ]; then
        echo "${green}Chaincode deployed successfully.${reset}"
    else
        echo "${red}Failed to deploy chaincode.${reset}"
        exit 1
    fi
    echo "${green}Task executed successfully${reset}"
    exit 0

elif [ "$task" = "n" ]; then
    # Shut down the existing network only
    cd $tn || { echo "${red}Failed to navigate to test-network directory. Exiting.${reset}"; exit 1; }
    echo "${red}Shutting down existing network${reset}"
    ./network.sh down
    if [ $? -eq 0 ]; then
        echo "${green}Network shut down successfully.${reset}"
    else
        echo "${red}Failed to shut down the network.${reset}"
        exit 1
    fi
    echo "${green}Task executed successfully${reset}"
    exit 0

else
    # Invalid input handling
    echo "${red}Invalid input. Please enter 'y' to start the network or 'n' to shut it down.${reset}"
    exit 1
fi
