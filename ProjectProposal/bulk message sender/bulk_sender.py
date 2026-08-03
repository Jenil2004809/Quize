import time
import random
import pywhatkit as pwk

# 1. Add your phone numbers here (must include country code, e.g., +91 for India, +1 for US)
phone_numbers = [
    "+919876543210",
    "+919876543211",
    "+919876543212",
    # Add the rest of your numbers here...
]

# 2. Your message combined with your image link
image_url = "https://yourwebsite.com/image.jpg"
message_text = f"Hello! Check out our latest updates here:\n{image_url}"

print("Starting bulk dispatch...")

# 3. Loop through each phone number with safety delays
for i, phone in enumerate(phone_numbers, start=1):
    try:
        print(f"[{i}/{len(phone_numbers)}] Sending message to {phone}...")
        
        # pwk.sendwhatmsg_instantly opens WhatsApp Web, types the text + link,
        # waits 15 seconds for link preview/image card to generate, then sends and closes the tab.
        pwk.sendwhatmsg_instantly(
            phone_no=phone,
            message=message_text,
            wait_time=15,
            tab_close=True,
            close_time=3
        )
        print(f"Successfully sent to {phone}")
        
        # IMPORTANT: Random pause between 20 to 30 seconds between numbers
        # This helps pace requests between automated messages.
        random_delay = random.randint(20, 30)
        print(f"Waiting {random_delay} seconds before next contact...")
        time.sleep(random_delay)
        
        # Batch break: Pause for 10 minutes every 50 messages
        if i % 50 == 0 and i < len(phone_numbers):
            print("Reached batch limit of 50. Pausing for 10 minutes...")
            time.sleep(600)
            
    except Exception as e:
        print(f"Failed to send to {phone}. Error: {e}")

print("All messages processing complete!")
