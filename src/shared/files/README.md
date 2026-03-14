# 40 Szablonów Dokumentów Prawnych dla Polski

## 📋 Zawartość

Ten pakiet zawiera **40 kompletnych szablonów dokumentów prawnych** przygotowanych zgodnie z polskim prawem pracy i cywilnym.

### Kategorie szablonów:

1. **UMOWY O PRACĘ** (5 szablonów)
   - Czas nieokreślony
   - Czas określony
   - Okres próbny
   - Część etatu
   - Praca zdalna

2. **UMOWY CYWILNOPRAWNE** (5 szablonów)
   - Umowa zlecenie standardowa
   - Umowa o dzieło
   - Umowa zlecenie długoterminowa
   - Umowa B2B
   - Umowa o świadczenie usług IT

3. **ANEKSY** (5 szablonów)
   - Zmiana wynagrodzenia
   - Zmiana stanowiska
   - Zmiana wymiaru czasu pracy
   - Zmiana miejsca pracy
   - Urlop bezpłatny

4. **WYPOWIEDZENIA** (5 szablonów)
   - Wypowiedzenie przez pracodawcę ze wskazaniem przyczyny
   - Wypowiedzenie przez pracodawcę bez wskazania przyczyny
   - Wypowiedzenie przez pracownika
   - Rozwiązanie za porozumieniem stron
   - Rozwiązanie bez wypowiedzenia

5. **ŚWIADECTWA PRACY** (5 szablonów)
   - Standardowe
   - Z informacją o urlopie
   - Wielokrotne zatrudnienie
   - Na żądanie pracownika
   - Dla emeryta

6. **REGULAMINY** (5 szablonów)
   - Regulamin pracy
   - Regulamin wynagradzania
   - Regulamin pracy zdalnej
   - Regulamin RODO (pracownicy)
   - Regulamin samochodu służbowego

7. **OŚWIADCZENIA I ZGODY** (5 szablonów)
   - NDA (oświadczenie o poufności)
   - Zakaz konkurencji
   - Zgoda RODO
   - Brak konfliktu interesów
   - Zgoda na nadgodziny

8. **INNE DOKUMENTY** (5 szablonów)
   - Polecenie wyjazdu służbowego
   - Wniosek o urlop
   - Zobowiązanie do zwrotu kosztów szkolenia
   - Potwierdzenie odbioru sprzętu
   - Wezwanie do złożenia wyjaśnień

---

## 🔧 Jak używać szablonów

### 1. Struktura każdego szablonu

Każdy plik `.md` zawiera:

**a) Metadane JSON** na początku:
```json
{
  "id": "employment_contract_indefinite",
  "name": "Umowa o pracę - czas nieokreślony",
  "category": "employment_contracts",
  "description": "...",
  "variables": [...]
}
```

**b) Treść dokumentu** ze zmiennymi w formacie: `{{nazwa_zmiennej}}`

### 2. Użycie zmiennych

Wszystkie zmienne są oznaczone podwójnymi nawiasami klamrowymi:

```
{{employer_name}}          → Nazwa pracodawcy
{{employee_first_name}}    → Imię pracownika
{{salary_gross}}           → Wynagrodzenie brutto
{{start_date}}             → Data rozpoczęcia
```

### 3. Wypełnianie szablonu

**Opcja A: Ręcznie**
1. Otwórz plik `.md` w edytorze tekstu
2. Znajdź wszystkie zmienne `{{...}}`
3. Zamień je na rzeczywiste wartości
4. Zapisz jako nowy plik

**Opcja B: Automatycznie (programowo)**
```python
import re

with open('szablon.md', 'r', encoding='utf-8') as f:
    content = f.read()

# Zamień zmienne
variables = {
    'employer_name': 'ABC Sp. z o.o.',
    'employee_first_name': 'Jan',
    'employee_last_name': 'Kowalski',
    # ...
}

for key, value in variables.items():
    content = content.replace(f'{{{{{key}}}}}', value)

with open('wypelniony_dokument.md', 'w', encoding='utf-8') as f:
    f.write(content)
```

### 4. Konwersja do Word/PDF

**Do Word (.docx):**
```bash
pandoc szablon.md -o dokument.docx
```

**Do PDF:**
```bash
pandoc szablon.md -o dokument.pdf
```

---

## ⚖️ Zgodność prawna

Wszystkie szablony są zgodne z:

✅ **Kodeksem Pracy** (Ustawa z 26.06.1974 r.)
- Art. 29 - minimalne warunki umowy o pracę
- Art. 25 - rodzaje umów o pracę
- Art. 52 - rozwiązanie bez wypowiedzenia
- Art. 97 - świadectwo pracy

✅ **Kodeksem Cywilnym** (Ustawa z 23.04.1964 r.)
- Art. 627-646 - umowa o dzieło
- Art. 734-751 - umowa zlecenia

✅ **RODO** (Rozporządzenie UE 2016/679)
- Art. 13 - klauzula informacyjna
- Przetwarzanie danych osobowych pracowników

✅ **Przepisami wykonawczymi** (stan na 2024/2025)

---

## 📝 Katalog szablonów

Szczegółowy katalog wszystkich szablonów znajdziesz w pliku:
- **00_KATALOG.md** - wersja tekstowa
- **00_catalog.json** - wersja JSON

---

## ⚠️ Ważne uwagi prawne

1. **Konsultacja prawna**: Szablony stanowią pomoc w przygotowaniu dokumentów. W przypadku skomplikowanych spraw lub sporów zalecana jest konsultacja z prawnikiem.

2. **Weryfikacja przepisów**: Prawo się zmienia - przed użyciem zweryfikuj aktualne przepisy.

3. **Dostosowanie do sytuacji**: Każda sytuacja jest inna - szablon może wymagać modyfikacji.

4. **Odpowiedzialność**: Użytkownik ponosi pełną odpowiedzialność za zastosowanie szablonów.

---

## 💡 Przykłady użycia

### Przykład 1: Umowa o pracę

```markdown
1. Wybierz szablon: 1.1_employment_contract_indefinite.md
2. Przeczytaj sekcję Metadata - sprawdź wymagane zmienne
3. Wypełnij wszystkie zmienne:
   - {{employer_name}} → "Tech Solutions Sp. z o.o."
   - {{employee_first_name}} → "Anna"
   - {{position}} → "Specjalista ds. IT"
   - itd.
4. Zapisz wypełniony dokument
5. Przekonwertuj do Word lub PDF
```

### Przykład 2: Aneks do umowy

```markdown
1. Wybierz szablon: 3.1_amendment_salary.md
2. Wypełnij:
   - {{contract_date}} → data umowy macierzystej
   - {{old_salary}} → dotychczasowe wynagrodzenie
   - {{new_salary}} → nowe wynagrodzenie
   - {{effective_date}} → data wejścia w życie
3. Wydrukuj i podpisz
```

---

## 📦 Zawartość pakietu

```
📁 40-szablonow-prawnych/
├── 00_KATALOG.md                           # Katalog wszystkich szablonów
├── 00_catalog.json                         # Katalog w formacie JSON
├── README.md                               # Ten plik
│
├── 1.1_employment_contract_indefinite.md
├── 1.2_employment_contract_fixed.md
├── 1.3_employment_contract_trial.md
├── 1.4_employment_contract_part_time.md
├── 1.5_employment_contract_remote.md
│
├── 2.1_contract_work_standard.md
├── 2.2_contract_specific_work.md
├── 2.3_contract_work_long_term.md
├── 2.4_b2b_cooperation.md
├── 2.5_it_services_agreement.md
│
├── 3.1_amendment_salary.md
├── 3.2_amendment_position.md
├── 3.3_amendment_work_time.md
├── 3.4_amendment_workplace.md
├── 3.5_amendment_unpaid_leave.md
│
├── 4.1_termination_by_employer_with_reason.md
├── 4.2_termination_by_employer_no_reason.md
├── 4.3_termination_by_employee.md
├── 4.4_termination_mutual_agreement.md
├── 4.5_termination_without_notice_employer.md
│
├── 5.1_work_certificate_standard.md
├── 5.2_work_certificate_with_vacation.md
├── 5.3_work_certificate_multiple_periods.md
├── 5.4_work_certificate_on_demand.md
├── 5.5_work_certificate_retirement.md
│
├── 6.1_work_regulations.md
├── 6.2_remuneration_regulations.md
├── 6.3_remote_work_regulations.md
├── 6.4_gdpr_employees_regulations.md
├── 6.5_company_car_regulations.md
│
├── 7.1_nda_agreement.md
├── 7.2_non_compete_declaration.md
├── 7.3_gdpr_consent.md
├── 7.4_conflict_of_interest_declaration.md
├── 7.5_overtime_consent.md
│
├── 8.1_business_trip_order.md
├── 8.2_vacation_request.md
├── 8.3_training_cost_commitment.md
├── 8.4_equipment_handover_confirmation.md
└── 8.5_explanation_request.md
```

---

## 🎯 Dla kogo są te szablony?

✅ Działy HR w firmach  
✅ Małe i średnie przedsiębiorstwa  
✅ Startupy  
✅ Kancelarie prawne  
✅ Biura rachunkowe  
✅ Freelancerzy i konsultanci  
✅ Osoby zakładające działalność gospodarczą

---

## 📞 Wsparcie

W przypadku pytań lub problemów:
1. Przeczytaj katalog szablonów (00_KATALOG.md)
2. Sprawdź metadane w szablonie (sekcja JSON)
3. Skonsultuj się z prawnikiem w przypadku wątpliwości

---

## 📄 Licencja

Szablony dostarczone w celach informacyjnych i edukacyjnych. Zalecana jest weryfikacja przez specjalistę przed użyciem w sytuacjach prawnie wiążących.

---

**Wygenerowano:** 2025  
**Wersja:** 1.0  
**Liczba szablonów:** 40  
**Format:** Markdown (.md)

---

## 🚀 Szybki start

1. ✅ Pobierz wszystkie pliki
2. ✅ Przeczytaj **00_KATALOG.md**
3. ✅ Wybierz potrzebny szablon
4. ✅ Wypełnij zmienne
5. ✅ Zapisz i użyj!

**Powodzenia! 🎉**
