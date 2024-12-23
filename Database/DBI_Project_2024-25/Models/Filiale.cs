using System.ComponentModel.DataAnnotations;

namespace DBI_Project_2024_25.Models;

public class Filiale
{
    public Filiale()
    {
    }

    public Filiale(int id, string name, string adresse)
    {
        Id = id;
        Name = name;
        Adresse = adresse;
    }

    [Key] public int Id { get; set; } = -1;

    public string Name { get; set; } = default!;
    public string Adresse { get; set; } = default!;

    public ICollection<TierFiliale> TierFilialen { get; set; } = new List<TierFiliale>();
}