import win32com.client as win32
import os

def create_excel_with_states():
    # Start Excel application
    excel = win32.Dispatch("Excel.Application")
    excel.Visible = True   # Opens MS Excel visibly

    # Create a new workbook
    workbook = excel.Workbooks.Add()
    sheet = workbook.ActiveSheet

    # Add headers
    sheet.Cells(1, 1).Value = "State"
    sheet.Cells(1, 2).Value = "Capital"

    # Indian states and capitals
    states_and_capitals = [
        ("Andhra Pradesh", "Amaravati"),
        ("Arunachal Pradesh", "Itanagar"),
        ("Assam", "Dispur"),
        ("Bihar", "Patna"),
        ("Chhattisgarh", "Raipur"),
        ("Goa", "Panaji"),
        ("Gujarat", "Gandhinagar"),
        ("Haryana", "Chandigarh"),
        ("Himachal Pradesh", "Shimla"),
        ("Jharkhand", "Ranchi"),
        ("Karnataka", "Bengaluru"),
        ("Kerala", "Thiruvananthapuram"),
        ("Madhya Pradesh", "Bhopal"),
        ("Maharashtra", "Mumbai"),
        ("Manipur", "Imphal"),
        ("Meghalaya", "Shillong"),
        ("Mizoram", "Aizawl"),
        ("Nagaland", "Kohima"),
        ("Odisha", "Bhubaneswar"),
        ("Punjab", "Chandigarh"),
        ("Rajasthan", "Jaipur"),
        ("Sikkim", "Gangtok"),
        ("Tamil Nadu", "Chennai"),
        ("Telangana", "Hyderabad"),
        ("Tripura", "Agartala"),
        ("Uttar Pradesh", "Lucknow"),
        ("Uttarakhand", "Dehradun"),
        ("West Bengal", "Kolkata")
    ]

    # Write data into Excel
    row = 2
    for state, capital in states_and_capitals:
        sheet.Cells(row, 1).Value = state
        sheet.Cells(row, 2).Value = capital
        row += 1

    # Auto-fit columns
    sheet.Columns("A:B").AutoFit()

    # Save the file
    file_path = os.path.join(os.getcwd(), "Indian_States_and_Capitals.xlsx")
    workbook.SaveAs(file_path)

    print("Excel automation completed successfully.")

if __name__ == "__main__":
    create_excel_with_states()
