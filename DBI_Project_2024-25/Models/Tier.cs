namespace DBI_Project_2024_25.Models;

public class Tier
{
    public string Name { get; set; } = default!;
    public int Groesse { get; set; } = default!;
    public decimal Gewicht { get; set; } = default!;

    public ICollection<TierFiliale> TierFilialen = new List<TierFiliale>();

    public Tier(string name, int groesse, decimal gewicht)
    {
        Name = name;
        Groesse = groesse;
        Gewicht = gewicht;
    }
}