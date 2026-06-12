import subprocess
import os
import sys
import warnings
import platform
import json
import re


def generate_html(title, heading, paragraph):
    """
    Generate a simple HTML page.

    :param title: The title of the page.
    :param heading: The heading of the page.
    :param paragraph: The paragraph content of the page.
    """
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
    </head>
    <body>
        <h1>{heading}</h1>
        <p>{paragraph}</p>
    </body>
    </html>
    """
    return html

def write_to_file(filename, content):
    """
    Write content to a file.

    :param filename: The name of the file to write to.
    :param content: The content to write.
    """
    with open(filename, 'w') as f:
        f.write(content)



def main():

    #get alias the old fashioned way
    try:
        result = subprocess.run(
            r"awk -F'=' '/^alias=/ {print $2}' ~/config.main",
            shell=True,
            capture_output=True,
            text=True,
            check=True  # Raises an error if the command fails
        )
        alias = result.stdout.strip()
        print(f"alias: {alias}")
    except subprocess.CalledProcessError:
        print("Error: Command failed, possibly file not found or invalid.")
    except FileNotFoundError:
        print("Error: awk not found or file inaccessible.")



    #bitcoin stuff
    def Ask_Node(command):
        full_command = ["bitcoin-cli"] + bitcoin_cli_options + command
        try:
            rv = subprocess.check_output(full_command)
            #subprocess.run('echo "\\033]0;UTXOracle\\007"', shell=True)
            return rv
        except Exception as e:
            print("Error connecting to your node. Troubleshooting steps:\n")
            print("\t1) Make sure bitcoin-cli is working: try 'bitcoin-cli getblockcount'")
            print("\t2) Make sure bitcoind is running (and server=1 in bitcoin.conf)")
            print("\t3) If needed, set rpcuser/rpcpassword or point to the .cookie file")
            print("\nThe full command was:", " ".join(full_command))
            print("\nThe error from bitcoin-cli was:\n", e)
            sys.exit(1)


    # Set data_dir and expand ~ to the home directory
    data_dir = os.path.expanduser('~/')
    # Validate bitcoin.conf in data_dir
    conf_path = os.path.join(data_dir, "config.main")
    print(f"conf_path is: {conf_path}")
    if not os.path.exists(conf_path):
        print(f"Invalid Bitcoin data directory: {data_dir}")
        print("Expected to find 'config.main' in this directory.")
        sys.exit(1)

    #parse the conf file for the blocks dir and rpc credentials
    conf_path = os.path.join(data_dir, "config.main")
    conf_settings = {}
    if os.path.exists(conf_path):
        with open(conf_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    key, value = line.split("=", 1)
                    conf_settings[key.strip()] = value.strip().strip('"')

    # Build CLI options if specified in conf file
    bitcoin_cli_options = []
    if "bitcoin-rpcuser" in conf_settings and "bitcoin-rpcpassword" in conf_settings:
        bitcoin_cli_options.append(f"-rpcuser={conf_settings['bitcoin-rpcuser']}")
        bitcoin_cli_options.append(f"-rpcpassword={conf_settings['bitcoin-rpcpassword']}")
    else:
        cookie_path = conf_settings.get("rpccookiefile", "/mnt/bitcoind/.cookie")
        if os.path.exists(cookie_path):
            bitcoin_cli_options.append(f"-rpccookiefile={cookie_path}")
    if "bitcoin-rpcconnect" in conf_settings and "bitcoin-rpcport" in conf_settings:
        bitcoin_cli_options.append(f"-rpcconnect={conf_settings['bitcoin-rpcconnect']}")
        bitcoin_cli_options.append(f"-rpcport={conf_settings['bitcoin-rpcport']}")

    # for opt in ["bitcoin-rpcconnect"]:
    #     if opt in conf_settings:
    #         bitcoin_cli_options.append(f"-rpcconnect={conf_settings[opt]}")
    # NN to find this programmatically
    #bitcoin_cli_options.append(f"-rpcconnect=172.18.0.98")


    #get current block height from local node and exit if connection not made
    block_count_b = Ask_Node(['getblockcount'])
    block_count = int(block_count_b)             #convert text to integer
    block_count_consensus = block_count-6
    print(f"Block count is {block_count_consensus}")

    #webserver stuff
    title = "Hello World"
    heading = f"Welcome to {alias}"
    paragraph = f"The current consensus block height is {block_count_consensus}."
    filename = "index.html"

    html = generate_html(title, heading, paragraph)
    write_to_file(filename, html)
    print(f"HTML file generated: {filename}")





if __name__ == "__main__":
    main()
