import time
import random
import argparse
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.firefox import GeckoDriverManager
from faker import Faker

fake = Faker()

def run_single_subscription(subscription_url, base_url="http://localhost:3000"):
    # Setup Firefox options
    firefox_options = Options()
    # firefox_options.add_argument("--headless")  # Uncomment to run without browser window
    
    driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()), options=firefox_options)
    wait = WebDriverWait(driver, 15)

    try:
        def robust_click(xpath):
            for i in range(3):
                try:
                    el = wait.until(EC.element_to_be_clickable((By.XPATH, xpath)))
                    driver.execute_script("arguments[0].click();", el)
                    return
                except Exception:
                    time.sleep(0.5)
            raise Exception(f"Failed to click {xpath} after 3 attempts")

        def robust_fill(ph, val):
            for i in range(3):
                try:
                    el = wait.until(EC.presence_of_element_located((By.XPATH, f"//input[contains(@placeholder, '{ph}')]")))
                    el.clear()
                    el.send_keys(val)
                    return
                except Exception:
                    time.sleep(0.5)
            raise Exception(f"Failed to fill field {ph} after 3 attempts")

        # 1. Registration
        print(f"Registering a new customer at {base_url}/register...")
        driver.get(f"{base_url}/register")
        
        # Click Customer Role Button
        robust_click("//button[contains(text(), 'Customer')]")
        time.sleep(0.5)
        
        # Fill Form
        username = fake.name()
        email = fake.email()
        password = "Password123"
        
        print(f"Filling form for {email}...")
        robust_fill("John Doe", username)
        robust_fill("your@email.com", email)
        robust_fill("••••••••", password)

        # Submit
        robust_click("//button[contains(text(), 'Sign up')]")
        
        # Wait for redirect
        print(f"Waiting for registration to complete for {email}...")
        wait.until(EC.url_contains("/my-subscriptions"))
        print(f"Successfully registered {email}")

        # 2. Subscribe
        print(f"Navigating to subscription link: {subscription_url}")
        driver.get(subscription_url)
        
        # Click Subscribe Now
        time.sleep(2) # Wait for plans to load and animations
        
        subscribe_btns = wait.until(EC.presence_of_all_elements_located((By.XPATH, "//button[contains(., 'Subscribe Now')]")))
        
        if subscribe_btns:
            target_btn = random.choice(subscribe_btns)
            driver.execute_script("arguments[0].scrollIntoView();", target_btn)
            time.sleep(0.5)
            driver.execute_script("arguments[0].click();", target_btn)
            print("Subscribe button clicked!")
            
            # Wait for success
            wait.until(EC.url_contains("/my-subscriptions"))
            print(f"Subscription successful for {email}!")
        else:
            print(f"Could not find a Subscribe Now button for {email}.")

    except Exception as e:
        print(f"An error occurred for user {email if 'email' in locals() else 'unknown'}: {e}")
        driver.save_screenshot(f"bot_error_{int(time.time())}.png")
    finally:
        driver.quit()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="SubDesk Automated Subscriber Bot")
    parser.add_argument("url", help="The shareable subscription link (e.g., http://localhost:3000/subscribe/username)")
    parser.add_argument("--base", default="http://localhost:3000", help="Base URL of the application")
    parser.add_argument("-n", "--count", type=int, default=1, help="Number of users to add")
    
    args = parser.parse_args()
    
    print(f"--- SubDesk Bot Starting (Total Users: {args.count}) ---")
    for i in range(args.count):
        print(f"--- Processing user {i+1} of {args.count} ---")
        run_single_subscription(args.url, args.base)
        time.sleep(1) # Small delay between users
    
    print(f"\n--- Batch operation complete. Added {args.count} users. ---")
