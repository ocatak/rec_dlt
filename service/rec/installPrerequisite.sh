#!/bin/sh

red=`tput setaf 1`
green=`tput setaf 2`
cyan=`tput setaf 6`
reset=`tput sgr0`

wd=`pwd`

echo "${green}Installing chaincode dependencies..."
cd $wd/chaincode/
rm -rf node_modules
npm install
if [ $? -eq 0 ]; then
    echo "${green}Chaincode dependencies installed successfully.${reset}"
else
    echo "${red}Failed to install chaincode dependencies.${reset}"
    exit 1
fi

echo "${green}Installing application dependencies..."
cd $wd/server
rm -rf node_modules
npm install
if [ $? -eq 0 ]; then
    echo "${green}Application dependencies installed successfully.${reset}"
else
    echo "${red}Failed to install application dependencies.${reset}"
    exit 1
fi

echo "${cyan}All installations completed successfully!${reset}"
