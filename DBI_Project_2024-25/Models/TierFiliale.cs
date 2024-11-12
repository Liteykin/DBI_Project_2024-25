namespace DBI_Project_2024_25.Models;

public class TierFiliale
{
    public int FilialeId { get; set; } = default!;
    public string TierName { get; set; } = default!;
    public int Anzahl { get; set; } = default!;

    public TierFiliale(int filialeId, string tierName, int anzahl)
    {
        FilialeId = filialeId;
        TierName = tierName;
        Anzahl = anzahl;
    }
}