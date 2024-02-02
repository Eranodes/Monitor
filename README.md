# EraNodes Monitor

<img src="https://github.com/Eranodes/.github/blob/main/icons/eranodesbanner-transparent.png?raw=true" alt="EraNodes Monitor Logo" style="width: 300px;">

## Introduction
Greetings and welcome to EraNodes Monitor, an advanced monitoring solution crafted by G9 Aerospace. EraNodes Monitor stands as a robust platform tailored for monitoring and managing EraNodes. This tool is geared towards providing real-time insights into the status and performance of EraNodes, ultimately elevating the efficiency and reliability of EraNodes hosting systems.

## Features
EraNodes Monitor boasts a suite of powerful features, including:

- **Real-time Monitoring:** Stay informed with real-time monitoring capabilities for your EraNodes.
- **Customizable Alerting:** Tailor alerts and notifications to meet your specific requirements.
- **Historical Data Analysis:** Delve into historical data for comprehensive performance analysis.
- **User-friendly Dashboard:** Visualize data effortlessly through an intuitive and user-friendly dashboard.
- **Extensible Architecture:** Seamlessly integrate EraNodes Monitor with other systems for a smooth operation.

## Installation
To get started with EraNodes Monitor, follow these simple installation steps:

1. **Clone the Repository:** Execute `git clone https://github.com/EraNodes/Monitor.git`
2. **Navigate to Project Directory:** Move into the EraNodes-Monitor directory using `cd EraNodes-Monitor`
3. **Install Dependencies:** Run `npm install`
4. **Configure Environment Variables:**
    - Create a new file in your project directory named `.env`.
    - Open the `.env` file in a text editor.
    - Add the following lines with the corresponding values:

        ```env
        PORT=<PORT TO BE USED FOR SERVING>
        PORT=<PORT TO BE USED FOR QUERYING>
        MAIN_WEBSITE=eranodes.xyz
        DASHBOARD_WEBSITE=freedash.eranodes.xyz
        PANEL_WEBSITE=panel.eranodes.xyz
        DISCORD_WEBHOOK=<https://discord.com/api/webhooks/{webhook.id}/{webhook.token}>
        ```

        Ensure each variable is assigned its correct value.

5. **Start the Application:** Initiate the application with `node .`

## Usage
Leverage the capabilities of EraNodes Monitor with these straightforward steps:

1. **Run the Application:** Activate the EraNodes Monitor application.
2. **Access the Dashboard:** Open your preferred web browser and navigate to the intuitive dashboard.
3. **Efficient Monitoring:** Monitor and manage EraNodes efficiently through the user-friendly interface.

## Contributing
Your contributions and feedback are invaluable. If you have suggestions or would like to contribute to the project, please do so!

## License
This project is licensed under the [MIT License](LICENSE).

## Contact
For questions or feedback, feel free to reach out to the project maintainer: [G9MilitantsYT](https://github.com/g9militantsYT)

Your feedback and contributions are highly appreciated!