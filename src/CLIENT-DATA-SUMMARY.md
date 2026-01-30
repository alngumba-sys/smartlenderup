# 📋 Client Data Summary - 22 Clients

## Overview
Total clients extracted from screenshots: **22 clients**

---

## 📊 Client List with Loan Balances

| # | Client ID | Full Name | NRC Number | Phone | Email | Loan Balance |
|---|-----------|-----------|------------|-------|-------|--------------|
| 1 | CL00001 | PRISCAH LOICE MBUVI | 23806403 | 0720817837 | rosemutdava@gmail.com | 37,625.00 |
| 2 | CL00002 | DANIEL COLLINS MAKOKO MWATETI | 22482535 | 0710539049 | collinsmakoko@gmail.com | 35,475.00 |
| 3 | CL00003 | Ben Mbuvi | 11111118 | 0722798702 | - | 110,000.00 |
| 4 | CL00004 | George Munyau Kawaya | 22195033 | 0768374146 | KAWIRE73@GMAIL.COM | 0.00 |
| 5 | CL00005 | Yusuf Olela Omanya | 12508228 | +233501631240 | yolela@yahoo.com | 0.00 |
| 6 | CL00006 | Kifalu Samson Masha | 13143767 | +233540123785 | kifalumasha@gmail.com | 0.00 |
| 7 | CL00007 | BILLY BOSTON ANYONYI | 24090458 | +254728925856 | - | 143,300.00 |
| 8 | CL00008 | Geofrey Rogiers Mwandango | 23260758 | +254724046842 | qkilambae@gmail.com | 161,250.00 |
| 9 | CL00009 | Benson Njoronge | 20314554 | 0720244502 | - | 22,000.00 |
| 10 | CL00010 | James Mbuvi | 21019115 | +254720300338 | mbuvi.felix@yahoo.com | 28,750.00 |
| 11 | CL00011 | Nicholas Ndinagu Mwangi | 23118869 | +254721112397 | qttimwa@gmail.com | 345,000.00 |
| 12 | CL00012 | JUWERYIYA ALI MUHAMMAD | 13214492 | 0724442409 | JATMAYANJA@YAHOO.COM | 345,000.00 |
| 13 | CL00013 | James Collins | 11111111 | 072456544 | james.colllins@gmail.com | 0.00 |
| 14 | CL00014 | Stephen Mulu Nzavi | 11376836 | +254721881725 | mulunzavi@gmail.com | 220,000.00 |
| 15 | CL00015 | OLIVE KAMENE NDEVENI | 245858793 | 0728330108 | olivetina@gmail.com | 322,500.00 |
| 16 | CL00016 | Josphat Matheka | 11111112 | 0724514868 | josphat.matheka@gmail.com | 0.00 |
| 17 | CL00017 | NATALIA THOMAS | 11111113 | 0714239823 | - | 0.00 |
| 18 | CL00018 | Saumu Ouma | 37109668 | 0739584652 | - | 0.00 |
| 19 | CL00019 | SEBASTIAN PETER | 25225003 | 0726707944 | - | 0.00 |
| 20 | CL00020 | ELIZABETH WAWERU | 22000875 | 0718754331 | - | 0.00 |
| 21 | CL00021 | Eric Muthama | 25267113 | 0727268009 | emuthama4@gmail.com | 0.00 |
| 22 | CL00022 | ROONEY MBANI | 11111115 | 0725481920 | - | 0.00 |

---

## 💰 Clients with Active Loan Balances

| Client ID | Name | Loan Balance (KES) |
|-----------|------|-------------------|
| CL00011 | Nicholas Ndinagu Mwangi | 345,000.00 |
| CL00012 | JUWERYIYA ALI MUHAMMAD | 345,000.00 |
| CL00015 | OLIVE KAMENE NDEVENI | 322,500.00 |
| CL00014 | Stephen Mulu Nzavi | 220,000.00 |
| CL00008 | Geofrey Rogiers Mwandango | 161,250.00 |
| CL00007 | BILLY BOSTON ANYONYI | 143,300.00 |
| CL00003 | Ben Mbuvi | 110,000.00 |
| CL00001 | PRISCAH LOICE MBUVI | 37,625.00 |
| CL00002 | DANIEL COLLINS MAKOKO MWATETI | 35,475.00 |
| CL00010 | James Mbuvi | 28,750.00 |
| CL00009 | Benson Njoronge | 22,000.00 |

**Total Active Loans:** KES 1,770,900.00

---

## 📧 Clients Missing Email Addresses

These clients don't have email addresses in the screenshots:

- CL00003 - Ben Mbuvi
- CL00007 - BILLY BOSTON ANYONYI
- CL00009 - Benson Njoronge
- CL00017 - NATALIA THOMAS
- CL00018 - Saumu Ouma
- CL00019 - SEBASTIAN PETER
- CL00020 - ELIZABETH WAWERU
- CL00022 - ROONEY MBANI

---

## 🌍 International Phone Numbers

Some clients have international phone numbers (outside Kenya):

- CL00005 - Yusuf Olela Omanya: +233501631240 (Ghana)
- CL00006 - Kifalu Samson Masha: +233540123785 (Ghana)

---

## 📝 Notes

1. **Client ID Format:** CL + 5 digits (CL00001 - CL00022)
2. **NRC Number:** National Registration Card number (ID number)
3. **Status:** All clients set to 'active'
4. **Loan Balances:** Will be created separately in loan records
5. **ON CONFLICT:** Script uses ON CONFLICT to update if client already exists

---

## 🚀 How to Use

### **Run the SQL Script:**
1. Copy `/insert-clients-batch-1.sql`
2. Paste into Supabase SQL Editor
3. Click "Run"
4. Verify with the SELECT query at the end

### **Verify Results:**
After running, you should see all 22 clients in the verification query.

---

## 🔄 Next Steps

After inserting clients, you'll need to:
1. ✅ Create loan records for the 11 clients with loan balances
2. ✅ Link loans to clients using client_id
3. ✅ Update Chart of Accounts with loan disbursements
4. ✅ Create payment histories for each loan

---

## 📊 Statistics

- **Total Clients:** 22
- **Clients with Loans:** 11
- **Clients without Loans:** 11
- **Total Loan Balance:** KES 1,770,900.00
- **Average Loan per Client:** KES 160,990.91
- **Largest Loan:** KES 345,000.00 (2 clients)
- **Smallest Loan:** KES 22,000.00

---

**Ready to insert? Run `/insert-clients-batch-1.sql` in Supabase!** ✅
